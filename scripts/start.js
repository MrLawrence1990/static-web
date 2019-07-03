var process = require('child_process');
var fs = require('fs')
var path = require('path')
var adm_zip = require('adm-zip')

var frontPath = path.resolve('./web')

fs.readdir(frontPath, function (err, files) {
  if (err) {
    console.log(err)
    console.log('\x1B[31m%s\x1B[0m', 'the file may be deleted, please update this project to lastest version from github')
    return
  }
  if (files.indexOf('node_modules') == -1) {
    console.log('-------------------install packages for web----------------------')
    let workerProcess = process.exec('npm install', {
      cwd: './web'
    }, function (error, stdout, stderr) {
      if (error !== null) {
        logError(error);
      } else {
        build()
      }
    });
    workerProcess.stdout.on('data', function (data) {
      console.log(data);
    });
    workerProcess.stderr.on('data', function (data) {
      logError(data);
    });
  } else {
    build();
  }
});

var build = function () {
  fs.readdir('view', (err, files) => {
    if (files.indexOf('index.html') > -1) {
      run()
    } else {
      console.log('-------------------build web----------------------')
      let workerProcess = process.exec('npm run build', {
        cwd: './web'
      }, function (error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        } else {
          var zip = new adm_zip()
          zip.addLocalFolder('./web/build')
          zip.writeZip('./view/web.zip')
          var tarZip = new adm_zip('./view/web.zip')
          tarZip.extractAllTo('./view')
          run()
        }
      });
      workerProcess.stdout.on('data', function (data) {
        console.log(data);
      });
      workerProcess.stderr.on('data', function (data) {
        console.log('error: ' + data);
      });
    }
  })
}

var run = function () {
  console.log('-------------------running server----------------------')
  let workerProcess = process.exec('node ./bin/www', function (error, stdout, stderr) {
    if (error !== null) {
      logError(error)
    }
  });
  workerProcess.stdout.on('data', function (data) {
    console.log(data);
  });
  workerProcess.stderr.on('data', function (data) {
    logError(data)
  });
}

var logError = function (info) {
  console.log('\x1B[31m%s\x1B[0m', info)
}