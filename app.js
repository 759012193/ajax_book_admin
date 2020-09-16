
//引入类库相关
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


// 引入权限控制函数
const authControl = require('./middleWare/authControl');

// 引入session相关
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const database = require('./config/config').database;
const sessionStore = new MySQLStore({
    host: database.HOST,
    port: database.PORT,
    user: database.USER,
    password: database.PASSWORD,
    database: database.DATABASE
});

//引入路由
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const app = express();

// 模版引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//session中间件
app.use(session({
  key: 'ajax_book',
  secret: 'ajax_book', // 加密字符串
  store: sessionStore,
  resave: true, // 强制保存session, 即使她没有变化
  saveUninitialized: true, // 强制初始化
  cookie: {maxAge: 24 * 3600 * 1000},
  // cookie: {maxAge: 1000},
  rolling: true //在每次请求时进行设置cookie，将重置cookie过期时间
}));
//继承默认的中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//引入权限控制中间件
app.use(authControl)
//引入路由中间件
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth/admin',adminRouter);

// 处理404
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
