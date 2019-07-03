var express = require('express');
var ApiResult = require('../entity/result');
var router = express.Router();

/* GET users listing. */
router.post('/', function (req, res, next) {
    delete req.session.userid;
    res.clearCookie('user');
    res.end(JSON.stringify(new ApiResult(200, 'success')));
});

module.exports = router;
