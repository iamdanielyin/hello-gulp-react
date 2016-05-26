/**
 * Gulp构建脚本
 * @author yinfxs
 * @time 2016-05-26 11:08:16
 */

'use strict';

const gulp = require('gulp'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify'),
    htmlmin = require('gulp-htmlmin'),
    runSequence = require('run-sequence');

// 服务端构建任务
gulp.task('server', function () {
    return gulp.src('src/server/**/*.js')      //引入所有需处理的JS
        .pipe(babel({presets: ['es2015']}))//babel转换ES2015语法
        .pipe(jshint.reporter('default'))         //JS代码检查
        .pipe(gulp.dest('./dist/server/'))        //构建后输出
        .pipe(notify({message: '服务端构建完成'}));
});

// 管理后台样式处理任务
gulp.task('client:backend:styles', function () {
    return gulp.src('src/public/backend/styles/**/*.css')    //引入所有客户端样式文件
        .pipe(concat('backend.css'))           //合并样式文件
        .pipe(cleanCSS())                  //压缩合并文件
        .pipe(rename({suffix: '.min'}))   //重命名压缩文件
        .pipe(gulp.dest('./dist/public/backend/styles/'))      //输出压缩后的文件
        .pipe(notify({message: '管理后台样式处理完成'}));
});

// 客户端样式处理任务
gulp.task('client:frontend:styles', function () {
    return gulp.src('src/public/frontend/styles/**/*.css')    //引入所有客户端样式文件
        .pipe(concat('frontend.css'))           //合并样式文件
        .pipe(cleanCSS())                  //压缩合并文件
        .pipe(rename({suffix: '.min'}))   //重命名压缩文件
        .pipe(gulp.dest('./dist/public/frontend/styles/'))      //输出压缩后的文件
        .pipe(notify({message: '客户端样式处理完成'}));
});


// 管理后台网页压缩处理任务
gulp.task('client:backend:htmls', function () {
    return gulp.src('src/client/backend/*.html')    //引入所有管理后台网页文件
        .pipe(htmlmin({collapseWhitespace: true}))           //压缩网页文件
        .pipe(gulp.dest('./dist/client/backend/'))      //输出压缩后的文件
        .pipe(notify({message: '管理后台网页压缩处理完成'}));
});

// 客户端网页压缩处理任务
gulp.task('client:frontend:htmls', function () {
    return gulp.src('src/client/frontend/*.html')    //引入所有客户端网页文件
        .pipe(htmlmin({collapseWhitespace: true}))           //压缩网页文件
        .pipe(gulp.dest('./dist/client/frontend/'))      //输出压缩后的文件
        .pipe(notify({message: '客户端网页压缩处理完成'}));
});

// 管理后台模块处理任务
gulp.task('client:backend:scripts', function () {
    return gulp.src('src/client/backend/**/*.+(js|jsx)')      //引入所有需处理的JS和JSX文件
        .pipe(babel({presets: ['es2015', 'react']}))
        .pipe(concat('backend.js'))                  //合并所有文件
        .pipe(uglify())                           //压缩合并文件
        .pipe(rename({suffix: '.min'}))         //重命名压缩文件
        .pipe(gulp.dest('./dist/client/backend/'))        //输出压缩后的文件
        .pipe(notify({message: '管理后台模块处理完成'}));
});

// 客户端模块处理任务
gulp.task('client:frontend:scripts', function () {
    return gulp.src('src/client/frontend/**/*.+(js|jsx)')      //引入所有需处理的JS和JSX文件
        .pipe(babel({presets: ['es2015', 'react']}))
        .pipe(concat('frontend.js'))                  //合并所有文件
        .pipe(uglify())                           //压缩合并文件
        .pipe(rename({suffix: '.min'}))         //重命名压缩文件
        .pipe(gulp.dest('./dist/client/frontend/'))        //输出压缩后的文件
        .pipe(notify({message: '客户端模块处理完成'}));
});

// 管理后台图片处理任务
gulp.task('client:backend:images', function () {
    return gulp.src('src/public/backend/images/**/*')        //引入所有需处理的图片文件
        .pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))      //压缩图片
        .pipe(gulp.dest('./dist/public/backend/images/')) //输出压缩后的图片
        .pipe(notify({message: '管理后台图片处理完成'}));
});

// 客户端图片处理任务
gulp.task('client:frontend:images', function () {
    return gulp.src('src/public/backend/images/**/*')        //引入所有需处理的图片文件
        .pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))      //压缩图片
        .pipe(gulp.dest('./dist/public/backend/images/')) //输出压缩后的图片
        .pipe(notify({message: '客户端图片处理完成'}));
});

// 输出目录清理任务
gulp.task('clean', function () {
    return gulp.src(['./dist'], {read: false})
        .pipe(clean());
});

// 文档临听任务
gulp.task('watch', function () {
    gulp.watch('src/server/**/*.js', ['server']);//监听服务端
    gulp.watch('src/public/frontend/styles/**/*.css', ['client:frontend:styles']);//监听客户端样式
    gulp.watch('src/public/backend/styles/**/*.css', ['client:backend:styles']);//监听管理后台样式
    gulp.watch('src/client/frontend/**/*.+(js|jsx)', ['client:frontend:scripts']);//监听客户端脚本
    gulp.watch('src/client/backend/**/*.+(js|jsx)', ['client:backend:scripts']);//监听管理后台脚本
    gulp.watch('src/public/frontend/images/**/*', ['client:frontend:images']);//监听客户端图片资源
    gulp.watch('src/public/backend/images/**/*', ['client:backend:images']);//监听管理后台图片资源
    gulp.watch('src/client/frontend/*.html', ['client:frontend:htmls']);//监听客户端网页资源
    gulp.watch('src/client/backend/*.html', ['client:backend:htmls']);//监听管理后台网页资源
});

// 注册默认任务
gulp.task('build', ['server',
    'client:backend:styles', 'client:frontend:styles',
    'client:backend:scripts', 'client:frontend:scripts',
    'client:backend:images', 'client:frontend:images',
    'client:backend:htmls', 'client:frontend:htmls'
]);

// 注册默认任务
gulp.task('default', function () {
    runSequence('clean', 'build');
});