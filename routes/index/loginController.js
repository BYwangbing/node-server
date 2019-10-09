const db = require('../../modelus/db');
const express = require('express');
const svgCaptcha = require('svg-captcha')
const session = require('express-session');
const router = express.Router();
var receive_captcha;

// 设置官方文档提供的中间件
router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    },
    rolling: true
}));
//定义返回变量格式
var resData;
router.use(function (req, res, next) {
    resData = {
        code: 0,
        message: '',
    };
    next();
});
// 测试查找所有用户
router.get('/text', function (req, res, next) {
    db.find('user', {}, function (error, data) {
        res.send(data)
    })
})
// 一次性图形验证码
router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create({
        ignoreChars: '0o1l',
        noise: 3,
        color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: '#EFEFEF' // 验证码图片背景颜色
    });
    receive_captcha = captcha.text.toLowerCase()
    // req.session.captcha = captcha.text.toLowerCase();
    // console.log(req.session.captcha);
    res.type('svg');
    res.send(captcha.data)
});
// 登录
router.post('/login', function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    const captcha = req.body.captcha.toLowerCase()
    // 拿到前台传过来的值
    console.log(req.body);
    //  用户名密码非空判断
    if (username === '' || password === '') {
        resData.code = 1;
        resData.message = '用户名或密码不能为空';
        res.json(resData);
        return;
    }
    // 验证码判断
    if (captcha != receive_captcha) {
        resData.code = 1;
        resData.message = '验证码不正确';
        res.json(resData);
        return;
    }
    // 删除保存的验证码
    // delete req.session.captcha
    //查询数据库验证用户名和密码
    db.find('user', {
        username: username,
        password: password
    }, function (error, data) {
        if (data.length === 0) {
            resData.code = 1;
            resData.message = '用户名或密码错误';
            res.json(resData);
            return;
        }
        //验证通过则登录
        resData.code = 0;
        resData.message = '登录成功';
        resData.data = data[0];
        req.session.userInfo = data[0];
        res.json(resData);
        return;
    })
});
// 注册用户
router.post('/register', function (req, res, next) {
    // 拿到前台传过来的值
    // console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const repassword = req.body.rePassword;
    //邮箱号不能空
    const regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if (email === '') {
        resData.code = 1;
        resData.message = '邮箱号不能空';
        res.json(resData); //使用res.json的方法返回前端数据
        return;
    } else if (!regEmail.test(email)) {
        resData.code = 1;
        resData.message = '邮箱格式不正确',
            res.json(resData); //使用res.json的方法返回前端数据
        return;
    }
    //用户名不能空
    if (username === '') {
        resData.code = 1;
        resData.message = '用户名不能为空';
        res.json(resData); //使用res.json的方法返回前端数据
        return;
    }

    //密码不能为空
    if (password === '') {
        resData.code = 1;
        resData.message = '密码不能为空';
        res.json(resData);
        return;
    }
    //两次密码不能不一样
    if (repassword === '') {
        resData.code = 1;
        resData.message = '请确认密码';
        res.json(resData);
    } else if (password != repassword) {
        resData.code = 1;
        resData.message = '两次输入的密码不一致';
        res.json(resData);
        return;
    }
    // 查找数据库有没有相同的用户名 ，没有的话保存到数据库
    db.find('user', {
        email: email
    }, function (error, data) {
        console.log(data); //若控制台返回空表示没有查到数据
        if (data.length === 0) {
            //用户名没有被注册则将用户保存在数据库中
            db.insert('user', {
                username: username,
                password: password,
                email: email
            }, function () {
                resData.code = 0;
                resData.message = '注册成功';
                res.json(resData);
            })
            return;
        }
        //若数据库有该记录
        resData.code = 1;
        resData.message = '该邮箱号已被注册';
        res.json(resData);

    })
});
// 用户登出
router.get('/loginOut', function (req, res) {
    // 销毁session
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.send('用户已登出')
        }
    })
});

module.exports = router;
