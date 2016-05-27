/**
 * 每个模型默认包含三个字段:
 * -code:唯一,系统生成
 * -name:不唯一显示值,指定
 * -created:创建时间,系统生成
 */

'use strict';

const path = require('path'),
    util = require('util'),
    log = require(path.join(__dirname, '../config/log'))(module),
    _ = require('underscore'),
    coreutils = require('./coreutils');

var models = {};

/**
 * 根据模型编码获取模型对象
 * @param state
 * @returns {*}
 */
function getModelbyCode(state) {
    if (!state || !state.code || !state.app) return;
    let code = state.code;
    let Model = models[code];
    if (Model) return Model;
    let tModel = require(path.join(__dirname, '../models', code));
    if (!tModel || !tModel.model) throw Error('数据模型 ' + process.cwd() + 'app/models/' + code + ' 不存在');
    models[code] = tModel.model;
    return models[code];
}
/**
 * 日志
 * @param code
 * @param req
 * @param res
 */
function inlogs(code, req, res) {
    log.info('code:' + code);
    log.info('req.query:' + JSON.stringify(req.query));
    log.info('req.body:' + JSON.stringify(req.body));
}
/**
 * 模型初始化设置
 * @param state
 */
function initModel(state) {
    state.Model = getModelbyCode(state);
    state.fields = [];
    initFields(state.Model.schema.paths);
    initFields(state.Model.schema.virtuals);
}
/**
 * 字段初始化
 * @param state
 * @param ks
 */
function initFields(state, ks) {
    if (!ks) return;
    for (let f in ks) {
        if (state.fields.indexOf(f) != -1) continue;
        state.fields.push(f);
    }
}
/**
 * 原子性操作入口
 * @param state
 * @param req
 * @param res
 */
module.exports.curdTransfer = function curdTransfer(state, req, res) {
    inlogs(state.code, req, res);
    initModel(state);
    if (util.isFunction(state.Model.startRoute)) {
        //回调startRoute方法
        state.Model.startRoute(state, req, res, startRouteCallback);
        return;
    }
    startRouteCallback(state, req, res);
};
/**
 * 进入路由状态 回调函数
 * @param state
 * @param req
 * @param res
 */
function startRouteCallback(state, req, res) {
    if (util.isFunction(state.Model.startCurd)) {
        state.Model.startCurd(state, req, res, startCurdCallback);
        return;
    }
    startCurdCallback(state, req, res);
}
/**
 * 获取查询对象的select字符串
 * @param tree
 * @param sub 是否带减号
 * @returns {Array}
 */
function getSchemaNotDeserialized(tree, sub) {
    let nodeseri = [];
    for (let key in tree) {
        if (!key) continue;
        let val = tree[key];
        if (!val) continue;
        if (val['sdeser'] === false) nodeseri.push((sub == true ? '-' : '') + key);
    }
    return nodeseri;
}
/**
 * 获取查询对象的select字符串
 * @param tree
 * @param sub 是否带减号
 * @returns {Array}
 */
function getSchemaNotSerialized(tree, sub) {
    let noseri = [];
    for (let key in tree) {
        if (!key) continue;
        let val = tree[key];
        if (!val) continue;
        if (val['sser'] === false) noseri.push((sub == true ? '-' : '') + key);
    }
    return noseri;
}

function setObjDefaults(state, obj) {
    if (state.Model.schema.tree.code && !obj.code) obj.code = coreutils.autoCode();
    if (state.Model.schema.tree.created && !obj.created) obj.created = coreutils.autoDate('YYYY-MM-DD,HH:mm:ss');
    //判断是否含有setDefaults方法
    if (state.Model.setDefaults) {
        obj = state.Model.setDefaults(obj);
    }
    return obj;
}
/**
 * 设置默认编码
 * @param state
 * @param obj
 * @returns {*}
 */
function setGlobalDefaults(state, obj) {
    if (!obj) return obj;
    if (!state.Model.schema.tree.code) return obj;
    if (!util.isArray(obj)) {
        obj = setObjDefaults(state, obj);
    } else {
        for (let i = 0; i < obj.length; i++) {
            if (!obj[i]) continue;
            obj[i] = setObjDefaults(state, obj[i]);
        }
    }
    return obj;
}
/**
 * 开始原子性操作 回调函数
 * @param state
 * @param req
 * @param res
 */
function startCurdCallback(state, req, res) {
    var noseri = getSchemaNotSerialized(state.Model.schema.tree);//不需要序列化的字段
    var nodeseri = getSchemaNotDeserialized(state.Model.schema.tree);
    switch (state.action) {
        case 'C':
            req.body = setGlobalDefaults(state, req.body);
            state.Model.create(coreutils.omit(req.body, nodeseri), function (err, result) {
                if (err) {
                    log.error('创建对象异常<' + state.code + '>:' + JSON.stringify(err));
                    return res.json({error: '服务器内部错误', detail: err});
                }
                state.data = coreutils.omit(result, noseri);
                if (util.isFunction(state.Model.endCurd)) {
                    state.Model.endCurd(state, req, res, endCurdCallback);
                    return;
                }
                endCurdCallback(state, req, res);
            });
            break;
        case 'U':
            state.Model.update(req.body.cond, coreutils.omit(req.body.doc, nodeseri), function (err, result) {
                if (err) {
                    log.error('更新对象异常<' + state.code + '>:' + JSON.stringify(err));
                    return res.json({error: '更新对象异常', detail: err});
                }
                state.data = result;
                if (util.isFunction(state.Model.endCurd)) {
                    state.Model.endCurd(state, req, res, endCurdCallback);
                    return;
                }
                endCurdCallback(state, req, res);
            });
            break;
        case 'R':
            let find = coreutils.omit(req.query, 'flag page size sort m mds');
            let query = state.Model.find(find);
            let flag = parseInt(req.query.flag) || 0;
            let page = parseInt(req.query.page) || 0;
            let size = parseInt(req.query.size) || 20;
            let sort = req.query.sort || '-created';
            let mds = req.query.mds || 0;
            if (flag == 2 && mds == 1) return res.json(state.Model.schema.tree);
            if (flag != 1) query.skip(page * size).limit(size);
            noseri = getSchemaNotSerialized(state.Model.schema.tree, true);
            if (noseri.length > 0)query.select(noseri.join(' '));
            query.sort(sort).exec(function (err, result) {
                if (err) {
                    log.error('查询对象异常<' + state.code + '>:' + JSON.stringify(err));
                    return res.json({error: '服务器内部错误', detail: err});
                }
                state.Model.count(find, function (err, count) {
                    if (err) {
                        log.error('查询对象异常<' + state.code + '>:' + JSON.stringify(err));
                        return res.json({error: '服务器内部错误', detail: err});
                    }
                    state.data = {
                        data: result,
                        totalels: count,
                        flag: flag,
                        sort: sort,
                        start: 0,
                        end: count
                    };
                    if (flag != 1) {
                        state.data.page = page;
                        state.data.size = size;
                        state.data.totalpgs = Math.ceil(count / size);
                        state.data.start = page * size;
                        let end = state.data.start + size;
                        state.data.end = end > state.data.totalels ? state.data.totalels : end;
                    }
                    if (mds == 1) {
                        //查询模型信息
                        state.data.mds = state.Model.schema.tree;
                    }
                    if (util.isFunction(state.Model.endCurd)) {
                        state.Model.endCurd(state, req, res, endCurdCallback);
                        return;
                    }
                    endCurdCallback(state, req, res);
                    return;
                });
            });
            break;
        case 'D':
            state.Model.remove(req.body, function (err, result) {
                if (err) {
                    log.error('删除对象异常<' + state.code + '>:' + JSON.stringify(err));
                    return res.json({error: '服务器内部错误', detail: err});
                }
                state.data = result;
                if (util.isFunction(state.Model.endCurd)) {
                    state.Model.endCurd(state, req, res, endCurdCallback);
                    return;
                }
                endCurdCallback(state, req, res);
            });
            break;
        default:
            res.end();
            break;
    }
}
/**
 * 完成原子性操作 回调函数
 * @param state
 * @param req
 * @param res
 */
function endCurdCallback(state, req, res) {
    if (util.isFunction(state.Model.endCurd)) {
        state.Model.endCurd(state, req, res, endRouteCallback);
        return;
    }
    endRouteCallback(state, req, res);
}
/**
 * 路由状态结束 回调函数
 * @param state
 * @param req
 * @param res
 */
function endRouteCallback(state, req, res) {
    return res.json(state.data);
}