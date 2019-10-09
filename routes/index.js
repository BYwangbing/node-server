// index.js是服务器调用的接口
const express = require('express');
const router = express.Router();

const admin = require('./index/loginController');
router.use('/', admin);
// demo
router.get('/giveSomeJson', function(req, res, next) {
  res.json({
    'title': 'jsonObj',
    '_time': new Date(),
    'time': Date.parse(new Date())
  })
});

module.exports = router;
