/**
 * 常用工具类
 * Created by yinfx on 16-1-13.
 */
'use strict';

const path = require('path'),
    util = require('util'),
    log = require(path.join(__dirname, '../config/log'))(module),
    fs = require('fs'),
    moment = require('moment'),
    _ = require('underscore');

moment.locale('zh-cn');

/**
 * 首字母大写
 * @param str
 * @returns {*}
 */
module.exports.firstUpper = function firstUpper(str) {
    str = str || '';
    if (!util.isString(str) || str.length == 0) return str;
    return str[0].toUpperCase() + str.substring(1);
};

/**
 * 首字母小写
 * @param str
 * @returns {*}
 */
module.exports.firstLower = function firstLower(str) {
    str = str || '';
    if (!util.isString(str) || str.length == 0) return str;
    return str[0].toLowerCase() + str.substring(1);
};

/**
 * 获取文件夹下面的所有的文件及文件夹（不包括子文件夹）
 * @param dir
 * @param callback
 */
module.exports.listdir = function (dir, callback) {
    fs.readdir(dir, function (err, result) {
        if (err) {
            log.error('遍历文件夹异常：' + err);
            return;
        }
        if (!result || result.length <= 0) return;
        for (let i in result) {
            if (!i || !result[i]) continue;
            fs.stat(path.join(dir, result[i]), function (err, stats) {
                if (err || !stats) {
                    log.error('遍历文件夹异常：' + err);
                    return;
                }
                if (util.isFunction(callback)) callback(result[i], stats);
            });
        }
    });
};


/**
 * 获取文件夹下面的所有的文件及文件夹（不包括子文件夹）
 * @param dir
 * @param callback
 */
module.exports.listdirSync = function (dir, callback) {
    let result = fs.readdirSync(dir);
    if (!result || result.length <= 0) return;
    for (let i in result) {
        if (!i || !result[i]) continue;
        let stats = fs.statSync(path.join(dir, result[i]));
        if (util.isFunction(callback)) callback(result[i], stats);
    }
};


/**
 * 简单非空校验
 * @param object 对象
 * @param valistr 校验字符串:不同键之间英文空格分隔,|号前面为键,后面为空值时的提示语
 */
module.exports.simpleValid = function (object, valistr) {
    if (!util.isObject(object) || !valistr) return;
    let result = [];
    let splits = valistr.split(' ');
    for (let i in splits) {
        if (!splits[i]) continue;
        let itSplit = splits[i].split('|');
        if (!itSplit || itSplit.length != 2) continue;
        let key = itSplit[0];
        let msg = itSplit[1];
        if (!key || !msg) continue;
        let value = object[key];
        if (!value) result.push(msg);
    }
    return result.length >= 0 ? result.join(',') : null;
};

/**
 * 生成编码的算法
 */
module.exports.autoCode = function () {
    console.log('autoCode...');
    let now = Date.now();
    return now + Math.floor(Math.random() * Math.pow(10, 10));
};

/**
 * 自动生成当前日期的字符串格式
 * @param format
 * @returns {*}
 */
module.exports.autoDate = function (format) {
    format = format || 'YYYY-MM-DD,HH:mm:ss';
    return moment().format(format);
};

function omit(data, ss) {
    if (!util.isObject(data) || (!util.isString(ss) && !util.isArray(ss))) return data;
    if (!util.isArray(data)) return _.omit(data, (util.isString(ss) ? ss.split(' ') : ss));
    let arr = [];
    for (let i in data) {
        if (!i || !util.isObject(data[i])) continue;
        arr.push(_.omit(data[i], (util.isString(ss) ? ss.split(' ') : ss)));
    }
    return arr;
}

/**
 * 对underscore的omit函数的数组扩展
 * @param data
 * @param ss 字段格式化字符串或数组,多个以英文空格分隔,如'code name remark'
 * @returns {*}
 */
module.exports.omit = omit;