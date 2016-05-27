/**
 * 路由核心处理类
 * Created by yinfx on 16-1-23.
 */

'use strict';

const path = require('path');
const util = require('util');
const log = require(path.join(__dirname, '../config/log'))(module);
const coreutils = require(path.join(__dirname, './coreutils'));

let obj = {};

/**
 * 初始化路由
 */
function initRoutes(app) {
    //动态注册所有routes中的路由，注册规则为module，module导出对象为express.Router()
    coreutils.listdirSync(path.join(__dirname, '../routes'), function (filename, stats) {
        if (!stats.isFile()) return;
        if (!filename.endsWith('.js')) return;
        let m = require(path.join(__dirname, '../routes', filename));
        if (!m) return;
        let r = '/api/routes/' + filename.substring(0, filename.indexOf('.'));
        app.use(r, m);
        log.info('已动态挂载路由 ' + r + ' .');
    });
    //动态注册所有models中的路由，注册规则为module.router，module导出对象的router为express.Router()
    coreutils.listdirSync(path.join(__dirname, '../models'), function (filename, stats) {
        if (!stats.isFile()) return;
        if (!filename.endsWith('.js')) return;
        let m = require(path.join(__dirname, '../models', filename));
        if (!m || !m.router) return;
        let r = '/api/models/' + filename.substring(0, filename.indexOf('.'));
        app.use(r, m.router);
        log.info('已动态挂载路由 ' + r + ' .');
    });
}

obj.initRoutes = initRoutes;

module.exports = obj;