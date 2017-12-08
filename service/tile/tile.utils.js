const http = require('http');
const fs = require('fs');

const constant = require('../constant');

/**
 * 地图经纬度转换为瓦片坐标
 * @param {*} lng 
 * @param {*} lat 
 * @param {*} zoom 
 */
function LngLat2XY(lng, lat, zoom) {
    let max = Math.pow(2, zoom);
    let x = Math.floor((lng + 180) / 360 * max);
    let lat_rad = lat * Math.PI / 180;
    let y = Math.floor((1 - (Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI)) / 2 * max);
    return [x, y];
}

/**
 * 构建地图瓦片下载地址
 * @param {*} x 
 * @param {*} y 
 * @param {*} z 
 * @param {*} option 
 */
function createDownloadUrl(x, y, z, option) {
    option = option || {
        lang: 'zh_cn',
        size: '1',
        style: '7', //矢量地图
        scl: '1',
        ltype: '3' //地图覆盖物: 底图+路网图
    }

    return constant.DOWNLOAD_URLS[Math.floor(Math.random() * 4)] +
        '?lang=' + option.lang +
        '&size=' + option.size +
        '&style=' + option.style +
        '&scl=' + option.scl +
        '&ltype=' + option.ltype +
        '&x=' + x +
        '&y=' + y +
        '&z=' + z;
}

module.exports = () => {
    return {
        /**
         * 计算一块区域的地图瓦片起始坐标
         */
        calcTiles: (wn, es, zoom) => {
            return {
                start: LngLat2XY(wn[0], wn[1], zoom),
                end: LngLat2XY(es[0], es[1], zoom)
            }
        },
        /**
         * 获取默认瓦片
         */
        getBlankTile: () => {
            return fs.readFileSync(process.cwd() + constant.TILE_NO_PNG);
        },
        /**
         * 下载地图瓦片
         */
        downloadTile: (x, y, z, option) => {
            let url = createDownloadUrl(x, y, z, option);
            return new Promise((resolve, reject) => {
                let req = http.get(url, (res) => {
                    let tile = "";
                    res.setEncoding("binary");
                    res.on("data", function (chunk) {
                        tile += chunk;
                    });
                    res.on("end", function () {
                        resolve(tile);
                    });
                });
                req.on('error', (err) => {
                    return reject(err);
                });
            });
        }
    }
}