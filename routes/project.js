var express = require('express');
var router = express.Router();
var fs = require('fs'); // 载入fs模块
var Exception = require('../entity/exception');
var ApiResult = require('../entity/result');
var DbHandler = require('../db');

/* GET users listing. */
router.get('/', function (req, res, next) {
  let projectArr = [];
  fs.readdir('./view/project', function (err, files) {
    if (err) {
      throw new Exception(err);
    }
    let count = 0;
    for (const i in files) {
      let project = {
        name: files[i],
        project: []
      };
      fs.readdir('./view/project/' + project.name, function (err, subFiles) {
        if (err) {
          throw new Exception(err);
        }
        project.project = subFiles;
        projectArr.push(project);
        count++;
        if (count === files.length) {
          res.end(JSON.stringify(new ApiResult(200, 'success', projectArr)));
        }
      })
    }
  })
});

router.post('/add', function (req, res, next) {
  let name = req.body.projectName;
  fs.mkdir('./view/project/' + name, function (error) {
    if (error) {
      res.end(JSON.stringify(new ApiResult(500, '项目创建失败！')));
    } else {
      res.end(JSON.stringify(new ApiResult(200, 'success')));
    }
  })
})

router.post('/remove', function (req, res, next) {
  let name = req.body.projectName;
  let pwd = req.body.password;
  let username = req.session.username;
  let db = new DbHandler();

  db.connectDataBase().then((result) => {
    console.log(result);
  }).then((result) => {
    db.sql(`select * from user where name = ? and password = ?`, [username, pwd], 'all').then((list) => {
      if (list.length == 0) {
        res.end(JSON.stringify(new ApiResult(500, '校验失败！')));
      } else {
        deleteFolder('./view/project/' + name);
        res.end(JSON.stringify(new ApiResult(200, 'success')));
      }
    }).catch((err) => {
      res.end(JSON.stringify(new ApiResult(500, err)));
    });
  }).catch((err) => {
    console.error(err);
  });

})

function deleteFolder(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolder(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

module.exports = router;
