var express = require('express');
var router = express.Router();
var admin = require('./admin/userController');

router.use('/', admin);

module.exports = router;
