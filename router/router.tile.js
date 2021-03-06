const Router = require('koa-router');
const tiles = require('../service/db/db.tile')();

const tileRouter = new Router();

//加载地图瓦片
tileRouter.get('/tile/:x/:y/:z', async (ctx, next) => {
    let row = await tiles.get(ctx.params.x, ctx.params.y, ctx.params.z);
    ctx.set('Content-Type', 'image/png')
    if(row) {
        ctx.response.status = 200;
        ctx.set('Last-Modified', new Date(row.update_date * 1000))        
        ctx.res.write(row.tile,"binary");
        ctx.res.end();
    } else {
        ctx.body = await tiles.default(ctx.params.x, ctx.params.y, ctx.params.z);
    }
})
//缓存失败地图瓦片
.get('/tile/failure', (ctx, next) => {

})
.get('/', (ctx, next) => {
    ctx.redirect('/examples/Map.html');
});

module.exports = tileRouter.routes();