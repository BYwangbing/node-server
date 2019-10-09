const express = require('express');
const router = express.Router();

const user = require('./admin/userController')
router.use('/', user);

module.exports = router;
