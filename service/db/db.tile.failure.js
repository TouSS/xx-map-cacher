const db = require('./db.conn')();
const tempate = require('./db.template')();
/**
 * 地图瓦片缓存失败记录
 */
module.exports = () => {
    return {
        /**
         * 查询
         */
        query: async () => {
            let sql = 'select * from tile_failure';
            let conn = db.getConn();
            let rows = await tempate.query(conn, sql, []);
            db.close(conn);
            return rows;
        },
        /**
         * 保存
         */
        save: async (failure) => {
            let conn = db.getConn();
            let sql = 'insert into tile_failure(x, y, z, adcode, district, failed_times, failed_reason, add_date, update_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            let params = [failure.x, failure.y, failure.z, failure.adcode, failure.district, failure.failed_times, failure.failed_reason, failure.add_date, failure.update_date];
            await tempate.insert(conn, sql, params);
            db.close(conn);
        },
        /**
         * 删除
         */
        delete: async (x, y, z) => {
            let sql = 'delete from tile_failure where x=? and y=? and z=?';
            let conn = db.getConn();
            await tempate.delete(conn, sql, [x, y, z]);
            db.close(conn);
        },
        _get: async (conn, x, y, z) => {
            return await tempate.get(conn, 'select * from tile_failure where x=? and y=? and z=?', [x, y, z]);
        },
        _save: async(conn, failure) => {
            let row = await tempate.get(conn, 'select * from tile_failure where x=? and y=? and z=?', [failure.x, failure.y, failure.z]);
            let sql, params;
            if(row) {
                sql = 'update tile_failure set failed_times=?, update_date=? where x=? and y=? and z=?';
                params = [row.failed_times+1, failure.update_date, failure.x, failure.y, failure.z];
                await tempate.update(conn, sql, params);
            } else {
                sql = 'insert into tile_failure(x, y, z, adcode, district, failed_times, failed_reason, add_date, update_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params = [failure.x, failure.y, failure.z, failure.adcode, failure.district, failure.failed_times, failure.failed_reason, failure.add_date, failure.update_date];
                await tempate.insert(conn, sql, params);
            }
        },
        _delete: async (conn, x, y, z) => {
            let sql = 'delete from tile_failure where x=? and y=? and z=?';
            await tempate.delete(conn, sql, [x, y, z]);
        }
    }
}