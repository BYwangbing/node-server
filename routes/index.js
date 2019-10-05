// index.js是服务器调用的接口
var express = require('express');
var router = express.Router();

/* GET home page. */
// 定义一个 get 请求 path 为根目录
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BY&K！~~~"' });
});

// demo
router.get('/giveSomeJson', function(req, res, next) {
  res.json({
    'title': 'jsonObj',
    '_time': new Date(),
    'time': Date.parse(new Date())
  })
});

module.exports = router;
