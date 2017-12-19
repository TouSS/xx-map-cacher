const Koa = require('koa');
const app = new Koa();
const httpServer = require('http').createServer(app.callback());
const onerror  =  require('koa-onerror');
const html = require('koa-static');
const bodyParser = require('koa-bodyparser');

const tileRouter = require('./router/router.tile');
const init = require('./service/init');
const logger = require('./service/logger');

//500
onerror(app, {
    redirect: '/500.html'
});

//收到请求
app.use(async(ctx, next) => {
    logger.info('HTTP/' + ctx.method + ':' + ctx.url);
    await next();
});

//静态资源
app.use(html(__dirname + '/html'));
//参数绑定
app.use(bodyParser());
//路由
app.use(tileRouter);

//404
app.use(ctx => {
    ctx.redirect('/404.html');
});

//初始化(当前只有数据库)
init();

//启动瓦片交互socket服务器
require('./service/socket/server.tile')(httpServer);

httpServer.listen(3000);
logger.info('服务器启动完成...');