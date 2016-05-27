/**
 * 用户的数据模型
 * Created by yinfx on 15-10-18.
 */

'use strict';

const mongoose = require('mongoose'),
    crypto = require('crypto'),
    util = require('util'),
    path = require('path'),
    log = require(path.join(__dirname, '../config/log'))(module),
    redis = require(path.join(__dirname, '../config/redis')),
    coreutils = require(path.join(__dirname, '../core/coreutils')),
    Schema = mongoose.Schema,
    router = require('express').Router();

const schedata = {
    code: {type: String, unique: true, required: true, index: true, sname: '编码'},
    name: {type: String, required: true, sname: '名称'},
    remark: {type: String, sname: '备注'},
    created: {type: String, sname: '创建时间'},
    hashedPassword: {type: String, required: true, sser: false, sdeser: false},
    salt: {type: String, required: true, sser: false, sdeser: false}
};

require('../config/dbmsg')(mongoose);

const schema = new Schema(schedata);
const mdlcode = 'users';
/**
 * 加密密码
 * @param password 明文
 * @returns {*} 密文
 */
schema.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure – return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};
/**
 * 密码属性
 */
schema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        //产生密码盐：32位随机数+Base64编码
        this.salt = crypto.randomBytes(32).toString('base64');
        //more secure - this.salt = crypto.randomBytes(128).toString('base64');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._plainPassword;
    });
/**
 * 价差密码是否一致
 * @param password 明文
 * @returns {boolean} true一致，false不一致
 */
schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};


//****************************状态回调注册****************************
/**
 * 进入路由状态
 */
schema.static('startRoute', function (state, req, res, cb) {
    console.log('startRoute...用户');
    if (util.isFunction(cb)) cb(state, req, res);
});

/**
 * 路由状态结束
 */
schema.static('endRoute', function (state, req, res, cb) {
    console.log('endRoute...用户');
    if (util.isFunction(cb)) cb(state, req, res);
});

/**
 * 开始原子性操作前
 */
schema.static('startCurd', function (state, req, res, cb) {
    console.log('startCurd...用户');
    if (util.isFunction(cb)) cb(state, req, res);
});

/**
 * 完成原子性操作后
 */
schema.static('endCurd', function (state, req, res, cb) {
    console.log('endCurd...用户');
    if (util.isFunction(cb)) cb(state, req, res);
});
//****************************状态回调注册****************************

const Model = mongoose.model(coreutils.firstUpper(mdlcode), schema);

//****************************自定义路由****************************
router.post('/signin', function (req, res) {
    let error = coreutils.simpleValid(req.body, 'code|额...账号不能为空哦~ pass|密码也不能为空哦~');
    if (error) return res.json({error: error});
    Model.findOne({code: req.body.code}, function (err, data) {
        if (err) {
            log.error('用户登录异常:' + err);
            return res.json({error: '登录失败了...', detail: err});
        }
        if (!data) {
            log.error('用户登录失败：账号 ' + req.body.code + ' 不存在');
            return res.json({error: '额...账号 ' + req.body.code + ' 不存在哦'});
        }
        if (!data.checkPassword(req.body.pass)) return res.json({error: '账号密码不一致哦~'});
        redis.simpleGrantAuth({result: true, scope: 0, cdata: {uid: data.id}}, function (auth) {
            return res.json(auth || {error: '授权失败了...'});
        });
    });
});
router.get('/detail', function (req, res) {
    redis.simpleTokenAuth(req, res, function (auth) {
        console.log('授权信息...begin...');
        console.log(auth);
        console.log('授权信息...end...');
        res.end('获取授权信息...ok!');
    });
});
//****************************自定义路由****************************


//根据结构新建模型
module.exports.model = Model;
module.exports.mdlcode = mdlcode;
module.exports.router = router;
module.exports.schema = schema;