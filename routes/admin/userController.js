var db = require('../../modelus/db');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.send('登录');
});

//定义返回变量格式
var resData;
router.use(function (req, res, next) {
    resData = {
        code: 0,
        message: ''
    };
    next();
});
// 测试查找所有用户
router.get('/text', function (req, res, next) {
    db.find('user', {}, function (error, data) {
        res.send(data)
    })
})

// 登录
router.post('/login', function (req, res, next) {
    // 拿到前台传过来的值
    //  console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    if (username === '' || password === '') {
        resData.code = 1;
        resData.message = '用户名或密码不能为空';
        res.json(resData);
        return;
    }
    //查询数据库验证用户名和密码
    db.find('user', {
        username: username,
        password: password
    }, function (error, data) {
        if (data.length === 0) {
            resData.code = 2;
            resData.message = '用户名或密码错误';
            res.json(resData);
            return;
        }
        //验证通过则登录
        resData.message = '登录成功';
        resData.data = {
            _id: data._id,
            username: data.username
        };
        res.json(resData);
        return;
    })
});
// 注册用户
router.post('/register', function (req, res, next) {
    // 拿到前台传过来的值
    // console.log(req.body);
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var repassword = req.body.rePassword;
      //邮箱号不能空
      var regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
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
            resData.code = 2;
            resData.message = '用户名不能为空';
            res.json(resData); //使用res.json的方法返回前端数据
            return;
        }
        
    //密码不能为空
    if (password === '') {
        resData.code = 3;
        resData.message = '密码不能为空';
        res.json(resData);
        return;
    }
    //两次密码不能不一样
    if (password != repassword) {
        resData.code = 4;
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
        resData.code = 5;
        resData.message = '该邮箱号已被注册';
        res.json(resData);

    })
});

module.exports = router;
