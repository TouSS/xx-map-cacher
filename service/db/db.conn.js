const sqlite3 = require('sqlite3').verbose();
const constant = require('../constant');
/**
 * 数据库连接相关
 */
module.exports = () => {
    return {
        getConn: () => {
            return new sqlite3.Database(process.cwd() + '/' + constant.DB_FILE);
        },
        close: (conn) => {
            conn.close();
        },
        /**
         * 顺序执行
         */
        serialize: (conn) => {
            return new Promise((resolve, reject) => {
                conn.serialize(() => {
                    resolve();
                });
            });
        },
        /**
         * 并行执行
         */
        parallelize: (conn) => {
            return new Promise((resolve, reject) => {
                conn.parallelize(() => {
                    resolve();
                });
            });
        }
        
    }
}