var express = require('express');
var ApiResult = require('../entity/result');
var Exception = require('../entity/exception');
var DbHandler = require('../db');
var router = express.Router();

/* GET users listing. */
router.post('/', function (req, res, next) {
    let name = req.body.user;
    let pwd = req.body.password;
    let db = new DbHandler();
    db.connectDataBase().then((result) => {
        console.log(result);
    }).then((result) => {
        db.sql(`select * from user where name = ? and password = ?`, [name,pwd], 'all').then((list) => {
            if(list.length==0){
                res.end(JSON.stringify(new ApiResult(500,'账号或密码错误')));
            }else{
                req.session.userid =  list[0].id;
                req.session.username =  list[0].name;
                res.end(JSON.stringify(new ApiResult(200, 'success', list[0])));
            }
        }).catch((err) => {
            res.end(JSON.stringify(new ApiResult(500,err)));
        });
    }).catch((err) => {
        console.error(err);
    });

});

module.exports = router;
