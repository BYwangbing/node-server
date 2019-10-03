var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// ===路由信息(接口地址)开始存放在./routes目录下===
var indexRouter = require('./routes/index');    // home page 接口
var usersRouter = require('./routes/users');    // 用户接口

var app = express();

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "http://localhost:8080/");//配置客户端 localhost与127.0.0.1是一个意思
    if (req.method === 'OPTIONS') {
        /*让options请求快速返回*/
        res.send(200);
    }
    else {
        /*防止异步造成多次响应，出现错误*/
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    }
});

// view engine setup
// === 模板开始 ===
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var engine = require('ejs-mate');//添加引用

app.set('views', path.join(__dirname, 'views'));//在app.js中找到这个行
app.set('view engine', 'ejs');//修改jade为ejs
app.engine('ejs', engine);//添加这行

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);  // 在app中注册routes该接口
app.use('/users', usersRouter);     // 在app中注册users接口

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
