var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var indexRouter = require('./routes/index');
var projectRouter = require('./routes/project');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var uploadRouter = require('./routes/upload');
var docRouter = require('./routes/doc');
var ApiResult = require('./entity/result');
var ejs = require('ejs'); 
var cors = require("cors");

const authUrls=['/project/add','/project/remove','/upload','/upload/img','/doc/add'];

var app = express();
//设置允许跨域访问该服务.



app.use(cors({
  origin: ['http://localhost:3000','http://localhost:3001','http://localhost:3002'],
  // origin: ['http://localhost:3003'],
  methods: ["GET", "POST"],
  alloweHeaders: ["Content-Type", "Authorization","Cookie"],
  credentials:true
}))

app.use(session({
  name: 'user',
  secret: 'ZjHyl',  // 用来对session id相关的cookie进行签名
  store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis或者mongodb）
  saveUninitialized: false,  // 是否自动保存未初始化的会话，一定是true
  resave: true,  // 是否每次都重新保存会话，建议false
  cookie: {
    maxAge: 60*60 * 1000  // 有效期，单位是毫秒
  }
}));


app.use('/', indexRouter);

app.use(function (req, res, next) {
  // next()
  console.log(req.session.username);
  if ((authUrls.indexOf(req.path)>-1) && (!req.session.userid||!req.session.username)) {
    res.end(JSON.stringify(new ApiResult(403, 'login failed')));
  } else {
    next();//继续往下走
  }
});

// view engine setup
app.engine('html', ejs.__express);
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'view')));


app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/project', projectRouter);
app.use('/upload', uploadRouter);
app.use('/doc', docRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
