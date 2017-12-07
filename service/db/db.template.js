/**
 * 数据库操作模板
 */
module.exports = () => {
    return {
        /**
         * 查询，返回第一条
         */
        get: (conn, sql, params) => {
            return new Promise((resolve, reject) => {
                conn.get(sql, params, (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                })
            });
        },
        /**
         * 查询,返回所有
         */
        query: (conn, sql, params) => {
            return new Promise((resolve, reject) => {
                conn.all(sql, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                })
            });
        },
        /**
         * 插入
         */
        insert: (conn, sql, params) => {
            return new Promise((resolve, reject) => {
                conn.run(sql, params, (err) => {
                    if (err) return reject(err);
                    resolve();
                })
            });
            
        },
        /**
         * 删除
         */
        delete: (conn, sql, params) => {
            return new Promise((resolve, reject) => {
                conn.run(sql, params, (err) => {
                    if (err) return reject(err);
                    resolve();
                })
            });
        },
        /**
         * 更新
         */
        update: (conn, sql, params) => {
            return new Promise((resolve, reject) => {
                conn.run(sql, params, (err) => {
                    if (err) return reject(err);
                    resolve();
                })
            });
        }
    }
}