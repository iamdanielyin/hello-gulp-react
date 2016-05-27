/**
 * 简单数据模型
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
    Schema = mongoose.Schema;

const schedata = {
    code: {type: String, unique: true, required: true, index: true, sname: '编码'},
    name: {type: String, required: true, sname: '名称'},
    remark: {type: String, sname: '备注'},
    created: {type: String, sname: '创建时间'}
};
const schema = new Schema(schedata);
const mdlcode = 'simple';

const Model = mongoose.model(coreutils.firstUpper(mdlcode), schema);

//根据结构新建模型
module.exports.model = Model;
module.exports.mdlcode = mdlcode;
module.exports.schema = schema;