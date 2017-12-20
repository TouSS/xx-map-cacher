const db = require('./db.conn')();
const tempate = require('./db.template')();
const util = require('../tile/tile.utils')();
const logger = require('../logger');

/**
 * 地图瓦片处理操作
 */
module.exports = () => {
    return {
        /**
         * 获取，不处理连接
         */
        _get: async(conn, x, y, z) => {
            return await tempate.get(conn, 'select * from tile where x=? and y=? and z=?', [x, y, z]);
        },
        /**
         * 获取以缓存的地图瓦片
         * @param {*} x 
         * @param {*} y 
         * @param {*} z 
         */
        get: async(x, y, z) => {
            let conn = db.getConn();
            let row = await tempate.get(conn, 'select * from tile where x=? and y=? and z=?', [x, y, z]);
            db.close(conn);
            return row;
        },
        /**
         * 保存，不处理连接
         */
        _save: async(conn, tile) => {
            let row = await tempate.get(conn, 'select * from tile where x=? and y=? and z=?', [tile.x, tile.y, tile.z]);
            let sql, params;
            if (row) {
                sql = 'update tile set tile=?, update_date=? where x=? and y=? and z=?';
                params = [tile.tile, tile.update_date, row.x, row.y, row.z];
                await tempate.update(conn, sql, params);
            } else {
                sql = 'insert into tile (x, y, z, adcode, district, tile, add_date, update_date) values (?, ?, ?, ?, ?, ?, ?, ?)';
                params = [tile.x, tile.y, tile.z, tile.adcode, tile.district, tile.tile, tile.add_date, tile.update_date];
                await tempate.insert(conn, sql, params);
            }
        },
        /**
         * 保存地图瓦片
         * @param {*} tiles 
         */
        save: async(tile) => {
            let conn = db.getConn();
            let row = await tempate.get(conn, 'select * from tile where x=? and y=? and z=?', [tile.x, tile.y, tile.z]);
            let sql, params;
            if (row) {
                sql = 'update tile set tile=?, update_date=? where x=? and y=? and z=?';
                params = [tile.tile, tile.update_date, row.x, row.y, row.z];
                await tempate.update(conn, sql, params);
            } else {
                sql = 'insert into tile (x, y, z, adcode, district, tile, add_date, update_date) values (?, ?, ?, ?, ?, ?, ?, ?)';
                params = [tile.x, tile.y, tile.z, tile.adcode, tile.district, tile.tile, tile.add_date, tile.update_date];
                await tempate.insert(conn, sql, params);
            }
            db.close(conn);
        },
        /**
         * 未缓存默认图片
         */
        default: (x, y, z) => {
            return util.getBlankTile(x, y, z);
        }
    }
}