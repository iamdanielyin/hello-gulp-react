/**
 * 服务端主模块
 * Created by yinfxs on 16-5-26.
 */
'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require(path.join(__dirname, 'config/db'));
const log = require(path.join(__dirname, 'config/log'))(module);
const corecurd = require(path.join(__dirname, 'core/corecurd'));
const coreroutes = require(path.join(__dirname, 'core/coreroutes'));
const coreutils = require(path.join(__dirname, 'core/coreutils'));
const moment = require('moment');
const redis = require(path.join(__dirname, 'config/redis'));
moment.locale('zh-cn');

const app = express();

// uncomment after placing your favicon in /public
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/lib', express.static(path.join(__dirname, './../node_modules/')));
app.use('/public', express.static(path.join(__dirname, './../public/')));
app.use('/client', express.static(path.join(__dirname, './../client/')));
app.use(express.static(path.join(__dirname, '../client/')));
app.get('/backend', function (req, res) {
    console.log('ibird启动成功！');
    res.sendFile(path.join(__dirname, './client/backend/index.html'));
});

/**
 * 分发请求
 */
app.all('/api/modelacts', function (req, res, next) {
    //获取模型编码
    let code = req.query.m;
    if (!code) return res.json({error: '请指定查询参数m，该参数代表模型编码'});
    console.log('code', code);
    let state = {};
    state.code = code;
    state.app = app;
    switch (req.method) {
        case 'POST':
            //新增
            state.action = 'C';
            break;
        case 'PUT':
            //修改
            state.action = 'U';
            break;
        case 'GET':
            //查询
            state.action = 'R';
            break;
        case 'DELETE':
            //删除
            state.action = 'D';
            break;
    }
    corecurd.curdTransfer(state, req, res);
});


/**
 * 模型/路由初始化
 */
coreroutes.initRoutes(app);

// 异常处理

// 处理404错误
app.use(function (req, res, next) {
    return res.json({error: '对不起，您请求的地址不存在'});
});

// 生产环境下处理500错误
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            error: err.message,
            detail: err
        });
    });
}

// 生产环境下处理500错误，无堆栈异常
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: err.message
    });
});

app.listen(3000, function () {
    console.log('服务已正常运行，监听端口为3000');
});