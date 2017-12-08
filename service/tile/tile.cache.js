const util = require('../tile/tile.utils')();
const logger = require('../logger');
const db = require('../db/db.conn')();
module.exports = () => {
    const tiles = require('../db/db.tile')();
    const failures = require('../db/db.tile.failure')();

    return {
        /**
         * 失败记录重新缓存
         */
        reCacheTiles: async(reTiles, session) => {
            if (!reTiles || reTiles.length <= 0) {
                session.socket.emit('status', {
                    total: 0,
                    completed: 0,
                    failure: 0,
                    startTime: new Date().getTime(),
                    endTime: new Date().getTime()
                });
                return;
            }
            //下载状态报告
            session.total = reTiles.length;;
            session.completed = 0;
            session.failure = 0;
            session.startTime = new Date().getTime();
            //初始化计数器
            session.counter = 0

            //报告状态
            session.socket.emit('status', {
                total: session.total,
                completed: session.completed,
                failure: session.failure,
                startTime: session.startTime
            });

            let tile, params, add_date, update_date;
            let conn = db.getConn();
            await db.serialize(conn);
            for (let i = 0; i < reTiles.length; i++) {
                add_date = update_date = Math.floor(new Date().getTime() / 1000);
                try {
                    tile = reTiles[i];
                    tile.add_date = add_date;
                    tile.update_date = update_date;
                    tile.tile = await util.downloadTile(tile.x, tile.y, tile.z);
                    if (tile.tile) {
                        await tiles._save(conn, tile);
                        await failures._delete(conn, tile.x, tile.y, tile.z);

                        //缓存完成计数
                        session.completed++;
                    } else {
                        throw new Error('500: download tile failed .');
                    }
                } catch (error) {
                    logger.error(error);
                    await failures._save(conn, tile);
                    //缓存失败计数
                    session.failure++;
                }

                //计数器累加，每10次报告状态
                session.counter++;
                if (session.counter >= 10) {
                    //报告状态
                    session.socket.emit('status', {
                        total: session.total,
                        completed: session.completed,
                        failure: session.failure,
                        startTime: session.startTime
                    });
                    session.counter = 0;
                }
            }
            db.close(conn);

            //缓存完成
            session.endTime = new Date().getTime();
            session.socket.emit('status', {
                total: session.total,
                completed: session.completed,
                failure: session.failure,
                startTime: session.startTime,
                endTime: new Date().getTime()
            });

        },
        /**
         * 缓存地图
         */
        cacheTiles: async(districtCube, session) => {
            let cutXY = util.calcTiles(districtCube.cut.wn, districtCube.cut.es, districtCube.zoom);
            //下载状态报告
            session.total = (cutXY.end[0] - cutXY.start[0] + 1) * (cutXY.end[1] - cutXY.start[1] + 1);
            session.completed = 0;
            session.failure = 0;
            session.startTime = new Date().getTime();
            //初始化计数器
            session.counter = 0

            //报告状态
            session.socket.emit('status', {
                total: session.total,
                completed: session.completed,
                failure: session.failure,
                startTime: session.startTime
            });

            let tile, params;
            let conn = db.getConn();
            await db.serialize(conn);
            let add_date, update_date;
            for (let i = cutXY.start[0]; i <= cutXY.end[0]; i++) {
                for (let j = cutXY.start[1]; j <= cutXY.end[1]; j++) {
                    add_date = update_date = Math.floor(new Date().getTime() / 1000);
                    try {
                        tile = await util.downloadTile(i, j, districtCube.zoom);
                        if (tile) {
                            await tiles._save(conn, {
                                x: i,
                                y: j,
                                z: districtCube.zoom,
                                adcode: districtCube.adcode,
                                district: districtCube.name,
                                tile: tile,
                                add_date: add_date,
                                update_date: update_date
                            });

                            //缓存完成计数
                            session.completed++;
                        } else {
                            throw new Error('500: download tile failed .');
                        }
                    } catch (error) {
                        //缓存瓦片失败处理,保存错误记录
                        logger.error(error);

                        await failures._save(conn, {
                            x: i,
                            y: j,
                            z: districtCube.zoom,
                            adcode: districtCube.adcode,
                            district: districtCube.name,
                            failed_times: 1,
                            failed_reason: '' + error,
                            add_date: add_date,
                            update_date: update_date
                        });
                        //缓存失败计数
                        session.failure++;
                    }
                    //计数器累加，每10次报告状态
                    session.counter++;
                    if (session.counter >= 10) {
                        //报告状态
                        session.socket.emit('status', {
                            total: session.total,
                            completed: session.completed,
                            failure: session.failure,
                            startTime: session.startTime
                        });
                        session.counter = 0;
                    }
                }
            }
            db.close(conn);

            //缓存完成
            session.endTime = new Date().getTime();
            session.socket.emit('status', {
                total: session.total,
                completed: session.completed,
                failure: session.failure,
                startTime: session.startTime,
                endTime: new Date().getTime()
            });
        }
    }
}