const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());
const session = require('express-session');
// 设置官方文档提供的中间件
app.use(session({
    secret: 'keyboard cat', //值可以随便取
    resave: false, //即使 session 没有被修改，也保存 session 值，默认为 true
    saveUninitialized: true,
    rolling:true ,//只要页面由刷新，session值就会被保存
    cookie: { secure: true }   /*secure https这样的情况才可以访问cookie*/
}));

//设置跨域访问
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
//使用ejs/jade模板引擎   默认找views这个目录
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//配置public目录为我们的静态资源目录
app.use(express.static('public'));
app.use('/upload',express.static('upload'));

// 获取post
const bodyParser = require('body-parser');
// //配置body-parser中间件
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// ===路由信息(接口地址)开始存放在./routes目录下===
var indexRouter = require('./routes/index');    // home page 接口
var usersRouter = require('./routes/users');    // 用户接口

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
