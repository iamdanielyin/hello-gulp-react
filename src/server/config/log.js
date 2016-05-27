/**
 * 日志配置类
 */
'use strict';

const fs = require('fs'),
    winston = require('winston');

if (!fs.existsSync('./logs'))fs.mkdirSync('logs');
winston.emitErrs = true;

function logger(module) {
    return new winston.Logger({
        transports: [
            new winston.transports.File({
                name: 'info-file',
                level: 'info',
                filename: process.cwd() + '/logs/info.log',
                handleException: true,
                json: true,
                maxSize: 5242880, //5mb
                maxFiles: 2,
                colorize: false
            }),
            new winston.transports.File({
                name: 'error-file',
                level: 'error',
                filename: process.cwd() + '/logs/error.log',
                handleException: true,
                json: true,
                maxSize: 20971520, //20mb
                maxFiles: 5,
                colorize: false
            }),
            new winston.transports.Console({
                level: 'debug',
                label: getFilePath(module),
                handleException: true,
                json: false,
                colorize: true
            })
        ],
        exitOnError: false
    });
}

function getFilePath(module) {
    //using filename in log statements
    return module.filename.split('/').slice(-2).join('/');
}

module.exports = logger;
