const logger = require('../logger');
const sessionManager = require('./session.tile');
const cache = require('../tile/tile.cache')();
const failures = require('../db/db.tile.failure')();

module.exports = (httpServer) => {
    let server = require('socket.io')(httpServer);
    server.of('/tile').on('connection', (socket) => {
        let session = sessionManager.get(socket.id);
        session.address = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
        session.socket = socket;

        logger.info('Accept a connection from ' + session.address);
        socket.on('cacheTiles', (data) => {
            cache.cacheTiles(data, session);
        });
        socket.on('reCacheTiles', async(data) => {
            let rows = await failures.query(); 
            cache.reCacheTiles(rows, session);
        });
        socket.on('status', (data) => {
            socket.emit('status', {id: session.id});
        });

        socket.on('disconnect', (reason) => {
            logger.info('connection from ' + session.address + ' has closed because ' + reason);
            sessionManager.remove(session.id);
        });
    });
    logger.info('地图瓦片缓存交互socket服务器已处于监听状态...');
}