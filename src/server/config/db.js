/**
 * mongodb连接类
 */
'use strict';
const mongoose = require('mongoose'),
    log = require('./log')(module);
//MongoDB连接字符串官方文档：https://docs.mongodb.org/manual/reference/connection-string/
const config = {
    host: 'ds034279.mlab.com',
    port: 34279,
    database: 'ibird-test',
    user: 'master',
    pass: '!QAZ2wsx'
};
//连接字符串:mongodb://user:pass@localhost:port/database
mongoose.connect('mongodb://' + config.user + ':' + config.pass + '@' + config.host + ':' + config.port + '/' + config.database);
var db = mongoose.connection;//获取连接对象

db.on('error', function (err) {//连接异常
    log.error('MongoDB连接失败：', err.message);
});

db.once('open', function callback() {//连接成功
    log.info('MongoDB连接成功');
});

module.exports = mongoose;