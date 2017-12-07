const db = require('./db/db.conn')();
const logger = require('./logger');

/**
 * 初始化
 */
module.exports = () => {
    logger.info('初始化数据库...');
    //初始表创建
    let conn = db.getConn();
    //创建表 (tile)
    let table_tile_create_sql = 'CREATE TABLE IF NOT EXISTS tile (' +
        'x INTEGER,' +
        'y INTEGER,' +
        'z INTEGER,' +
        'adcode TEXT,' +
        'district TEXT,' +
        'tile BLOB,' +
        'add_date INTEGER,' +
        'update_date INTEGER)';
    //tile下载失败表
    let table_tile_failed_create_sql = 'CREATE TABLE IF NOT EXISTS tile_failure (' +
        'x INTEGER,' +
        'y INTEGER,' +
        'z INTEGER,' +
        'adcode TEXT,' +
        'district TEXT,' +
        'failed_times INTEGER,' +
        'failed_reason TEXT,' +
        'add_date INTEGER,' +
        'update_date INTEGER)';
    conn.serialize(() => {
        conn.run(table_tile_create_sql);
        conn.run(table_tile_failed_create_sql);
    });
    db.close(conn);

    //未处理错误捕获，防止程序崩溃
    process.on('uncaughtException', (error) => {
        console.error(error);
        logger.error(error);
    });
}