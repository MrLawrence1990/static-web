var express = require('express');
var fs = require('fs');
var multer = require('multer');
var ApiResult = require('../entity/result');

var router = express.Router();

function createHtml(content) {
    return '<!DOCTYPE html>' +
        '<html lang="zh">' +
        '<head>' +
        '    <meta charset="UTF-8" />' +
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
        '    <meta http-equiv="X-UA-Compatible" content="ie=edge" />' +
        '    <script src="/source/background.js"></script>' +
        '    <link rel="stylesheet" type="text/css" href="/source/background.css"/>' +
        '    <title>Document</title>' +
        '</head>' +
        '<body>' +
        '    <canvas id="cas"></canvas>'+
        '    <div id="document-container">' +
        '           <div id="document-content">' +
                    content +
        '           </div>' +
        '    </div>' +
        '</body>' +
        '</html>'
}

router.post('/add', function (req, res, next) {
    let name = req.body.documentName;
    let addTo = req.body.addTo;
    let content = req.body.content;
    var dirName = "./view/project/" + addTo + "/" + name;
    var des_file = dirName + '/index.html';


    fs.mkdir(dirName, function (err) {
        if (err) {
            console.log(err)
            res.end(JSON.stringify(new ApiResult(500, '文档创建失败！')));
        } else {
            fs.writeFile(des_file, createHtml(content), function (err) {
                if (err) {
                    console.log(err)
                    res.end(JSON.stringify(new ApiResult(500, '文档创建失败！')));
                } else {
                    res.end(JSON.stringify(new ApiResult(200, 'success')));
                }
            });
        }
    });
})

module.exports = router;
