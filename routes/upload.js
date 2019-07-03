var express = require('express');
var fs = require('fs');
var multer = require('multer');
var ApiResult = require('../entity/result');
var AdmZip = require('adm-zip');

var router = express.Router();
var upload = multer({ dest: 'upload_tmp/' });
var uploadImg = multer({ dest: 'view/source/imgs/' });




router.post('/', upload.single('file'), function (req, res, next) {
    let username = req.session.username;
    let addTo = req.body.addTo;
    let version = req.body.version;
    let isGBK = req.body.isGBK;
    var des_file = "./temp/" + username + "/" + req.file.originalname;
    fs.rename(req.file.path, des_file, function (err) {
        //更改保存目錄
        if (err) {
            res.end(JSON.stringify(new ApiResult(500, err)));
        } else {
            var zip;
            if (isGBK=="1") {
                zip = new AdmZip(des_file,'GBK');
            } else {
                zip = new AdmZip(des_file);
            }
            var zipEntries = zip.getEntries();
            let a = zipEntries[0];
            zip.extractAllTo("./temp/" + username);
            fs.rename("./temp/" + username + "/" + a.entryName.replace('/', ''), "./view/project/" + addTo + "/" + version, function (err) {
                if (err) {
                    res.end(JSON.stringify(new ApiResult(500, err)));
                }
            })
            fs.unlink(des_file, function () { });
            res.end(JSON.stringify(new ApiResult(200, 'success')));
        }
    })

});

router.post('/img', uploadImg.single('img'), function (req, res, next) {
    //先重命名
    let fullName = req.file.originalname;
    var index = fullName.lastIndexOf('.');
    let fileType = fullName.substring(index + 1, fullName.length)
    fs.rename(req.file.path, req.file.path + '.' + fileType, function (err) {
        if (err) {
            res.end(JSON.stringify(new ApiResult(500, err)));
        }
        res.end(JSON.stringify(new ApiResult(200, 'success', (req.file.path, req.file.path + '.' + fileType).replace('views', ''))));
    })

});

module.exports = router;
