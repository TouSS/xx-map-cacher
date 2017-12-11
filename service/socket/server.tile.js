const logger = require('../logger');
const sessionManager = require('./session.tile');
const cache = require('../tile/tile.cache')();
const failures = require('../db/db.tile.failure')();

module.exports = (httpServer) => {
    let server = require('socket.io')(httpServer);
    server.of('/tile').on('connection', (socket) => {
        let id = socket.id;
        let address = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
        let session = sessionManager.get(address);
        session.address = address;
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
            sessionManager.report(session);
        });

        socket.on('disconnect', (reason) => {
            logger.info('connection from ' + session.address + ' has closed because ' + reason);
            sessionManager.offline(session);
        });
    });
    logger.info('地图瓦片缓存交互socket服务器已处于监听状态...');
}