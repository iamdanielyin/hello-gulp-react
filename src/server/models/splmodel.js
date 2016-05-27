/**
 * 简单模型的数据模型
 * Created by yinfx on 15-10-18.
 */

'use strict';

const mongoose = require('mongoose'),
    crypto = require('crypto'),
    util = require('util'),
    path = require('path'),
    router = require('express').Router(),
    log = require(path.join(__dirname, '../config/log'))(module),
    coreutils = require(path.join(__dirname, '../core/coreutils')),
    Schema = mongoose.Schema;

require('../config/dbmsg')(mongoose);

//界面类型：单图 多图 单枚举 多枚举 单引用 多引用 字符串 布尔值 数值 日期 时间

const schedata = {
    code: {type: String, required: true, unique: true, index: true, sname: '编码'},
    name: {type: String, required: true, sname: '名称'},
    remark: {type: String, sname: '备注'},
    created: {type: String, sname: '创建时间'},
    img: {type: String, sname: '单图'},
    imgs: [{type: String, sname: '多图'}],
    senum: {type: String, enum: ['单枚举值1', '单枚举值2', '单枚举值3', '单枚举值4', '单枚举值5'], sname: '单枚举'},
    senums: [{type: String, enum: ['多枚举值1', '多枚举值2', '多枚举值3', '多枚举值4', '多枚举值5'], sname: '多枚举'}],
    sref: {type: Schema.Types.ObjectId, ref: 'Users', sname: '单引用'},
    srefs: [{type: Schema.Types.ObjectId, ref: 'Users', sname: '多引用'}],
    num: {type: Number, sname: '数字'},
    bool: {type: Boolean, sname: '布尔'},
    date: {type: String, sname: '日期'},
    time: {type: String, sname: '时间'}
};
const schema = new Schema(schedata);
const mdlcode = 'splmodel';


//****************************状态回调注册****************************
/**
 * 进入路由状态
 */
schema.static('startRoute', function (state, req, res, cb) {
    console.log('startRoute...简单模型');
    if (util.isFunction(cb)) cb(state, req, res);
});

/**
 * 路由状态结束
 */
schema.static('endRoute', function (state, req, res, cb) {
    console.log('endRoute...简单模型');
    if (util.isFunction(cb)) cb(state, req, res);
});

/**
 * 开始原子性操作前
 */
schema.static('startCurd', function (state, req, res, cb) {
    console.log('startCurd...简单模型');
    if (util.isFunction(cb)) cb(state, req, res);
});

/**
 * 完成原子性操作后
 */
schema.static('endCurd', function (state, req, res, cb) {
    console.log('endCurd...简单模型');
    if (util.isFunction(cb)) cb(state, req, res);
});
//****************************状态回调注册****************************

/**
 * 设置默认值的方法
 * @param obj
 * @returns {*}
 */
schema.static('setDefaults', function (obj) {
    obj.date = coreutils.autoDate('YYYY-MM-DD');
    obj.time = coreutils.autoDate('YYYY-MM-DD,HH:mm:ss');
    return obj;
});


const Model = mongoose.model(coreutils.firstUpper(mdlcode), schema);

//根据结构新建模型
module.exports.model = Model;
module.exports.router = router;
module.exports.schema = schema;
module.exports.mdlcode = mdlcode;