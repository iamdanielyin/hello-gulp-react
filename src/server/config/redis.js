/**
 * Redis配置模块
 * Created by yinfx on 16-1-19.
 */
'use strict';

const Redis = require('ioredis'),
    path = require('path'),
    util = require('util'),
    uuid = require('node-uuid'),
    _ = require('underscore'),
    log = require(path.join(__dirname, './log'))(module);
/**
 * Redis相关配置信息
 * 注意:
 *  expires_in的单位为秒
 * @type {{host: string, port: number, database: string, pass: string, expires_in: {access_token: number, refresh_token: number}}}
 */
const config = {
    host: 'Redis服务器IP或域名',
    port: 'Redis端口',
    database: '数据库',
    pass: 'Redis密码',
    expires_in: {
        access_token: 7 * 24 * 60 * 60,
        refresh_token: 30 * 24 * 60 * 60
    }
};
var redis = new Redis('redis://:' + config.pass + '@' + config.host + ':' + config.port + '/' + config.database);
redis.on('connect', function () {
    log.info('Redis连接成功');
});
redis.on('error', function (err) {
    log.error('Redis异常:' + err);
});
redis.on('close', function () {
    log.info('Redis连接关闭');
});

/**
 * 简单令牌授权
 服务端返回
 {
    "access_token": "QurTkDQxsrXB74a4efe6451Nh86B",<访问令牌,默认7天>
    "expires_in": "147160782",<有效毫秒数>
    "refresh_token": "QurTkDQxsrXBf3df2dbe9fBrrYdE"<更新令牌,默认30天>
  }
 服务端缓存:以access_token和refresh_token为key,以下内容为值
 {
    "access_token": "QurTkDQxsrXB74a4efe6451Nh86B",<访问令牌,默认7天>
    "expires_in": "147160782",<有效毫秒数>
    "refresh_token": "QurTkDQxsrXBf3df2dbe9fBrrYdE",<更新令牌,默认30天>
    "scope": 0<授权范围,0用户授权,1管理授权>
  }
 * @param cond 授权条件
 * <仅当条件返回指定对象结构时才允许授权> : {result:true,scope:0,cdata:{}},
 * 其中
 * result必须为boolean类型,表示是否授权;
 * scope必须为number类型,表示授权范围,0用户授权,1管理授权;
 * cdata必须为object类型,且所有key会被设置到授权对象中
 * @param cb 回调函数
 */
module.exports.simpleGrantAuth = function (cond, cb) {
    if (!util.isObject(cond) || !util.isFunction(cb)) {
        if (util.isFunction(cb)) return cb();
        return;
    }
    if (cond.result != true || cond.scope == undefined) return cb();
    let baseAuth = {};
    baseAuth.access_token = new Buffer(uuid.v1()).toString('base64');
    baseAuth.refresh_token = new Buffer(Date.now() + uuid.v4()).toString('base64');
    baseAuth.expires_in = config.expires_in.access_token || 7 * 24 * 60 * 60;
    if (util.isObject(cond.cdata) && _.keys(cond.cdata).length > 0) {
        for (let key in cond.cdata) {
            if (!key || !cond.cdata[key]) continue;
            baseAuth[key] = cond.cdata[key];
        }
    }
    let severAuth = _.clone(baseAuth);
    severAuth.scope = cond.scope;
    let base64Content = new Buffer(JSON.stringify(severAuth)).toString('base64');
    redis.set(severAuth.access_token, base64Content, 'ex', severAuth.expires_in);
    redis.set(severAuth.refresh_token, base64Content, 'ex', (config.expires_in.refresh_token || 30 * 24 * 60 * 60));
    cb(baseAuth);
};
/**
 * 简单令牌鉴权
 * @param req 请求对象
 * @param req 响应对象
 * @param cb 回调函数
 */
module.exports.simpleTokenAuth = function (req, res, cb) {
    let access_token = req.query.access_token || (req.body ? req.body.access_token : undefined);
    redis.get(access_token, function (err, result) {
        if (err) {
            log.error('简单令牌鉴权异常:' + err);
            return res.json({code: 10500, error: '服务端异常', detail: error});
        }
        if (!result)  return res.json({code: 10501, error: '未授权操作,请先授权'});
        let auth = JSON.parse(new Buffer(result, 'base64').toString());
        if (auth.access_token != access_token) return res.json({code: 10502, error: '无效的访问令牌'});
        if (!util.isFunction(cb)) return res.json({msg: 'ok'});
        cb(auth);
    });
};

/**
 * 移除授权信息
 * @param req 请求对象
 * @param req 响应对象
 * @param cb 回调函数
 */
module.exports.removeTokenAuth = function (req, res, cb) {
    let access_token = req.query.access_token || (req.body ? req.body.access_token : undefined);
    if (!access_token) return res.json({msg: 'ok'});
    redis.get(access_token, function (err, result) {
        if (err) {
            log.error('移除授权信息异常:' + err);
            return res.json({code: 10500, error: '服务端异常', detail: error});
        }
        if (!result)  return res.json({msg: 'ok'});
        let auth = JSON.parse(new Buffer(result, 'base64').toString());
        redis.del(auth.access_token);
        redis.del(auth.refresh_token);
        if (!util.isFunction(cb)) return res.json({msg: 'ok'});
        cb(auth);
    });
};

/**
 * 刷新访问令牌
 * @param req 请求对象
 * @param req 响应对象
 * @param cb 回调函数
 */
module.exports.refreshAccessToken = function (req, res, cb) {
    let refresh_token = req.query.refresh_token || (req.body ? req.body.refresh_token : undefined);
    redis.get(refresh_token, function (err, result) {
        if (err) {
            log.error('刷新访问令牌异常:' + err);
            return res.json({code: 10500, error: '服务端异常', detail: error});
        }
        if (!result)  return res.json({code: 10501, error: '未授权操作,请先授权'});
        let severAuth = JSON.parse(new Buffer(result, 'base64').toString());
        if (severAuth.refresh_token != refresh_token) return res.json({code: 10502, error: '无效的刷新令牌'});
        //刷新访问令牌
        severAuth.access_token = new Buffer(uuid.v1()).toString('base64');
        let baseAuth = _.omit(severAuth, 'scope');
        let base64Content = new Buffer(JSON.stringify(severAuth)).toString('base64');
        redis.set(severAuth.access_token, base64Content, 'ex', severAuth.expires_in);
        if (!util.isFunction(cb)) return res.json({msg: 'ok'});
        cb(baseAuth);
    });
};

module.exports.redis = redis;
