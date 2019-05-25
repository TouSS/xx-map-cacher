const http = require('http');
const fs = require('fs');
const Jimp = require('jimp');

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

    /*
        lang：语言 （中文：zh_cn，英文：en）
        style：地图类型（6：地图影像，7：矢量地图，8：路网图）
        ltype：地图覆盖物（1 - 7 分别为各种覆盖物，1：地图底图，2：路网图，3：底图+路网图，4：poi标注，5：底图+poi标注，6：路网图+poi标注，7：底图+路网图+poi标注），注：当用8取模为1 - 7时同样适用 
        size：未知，默认 1
        scl：未知，默认 1

        说明: 地图类型为矢量地图时, 此时如果下载带标注的瓦片, 标注内容会明显放大且有缺失. 解决办法: 选择地图类型为路网图去单独下载标注, 然后在将地图与标注合并.
    */
    option = option || {
        lang: 'zh_cn',
        size: '1',
        style: '7', //矢量地图
        scl: '1',
        ltype: '7' //地图覆盖物: 底图+路网图
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
        getBlankTile: async(x, y, z) => {
            //return fs.readFileSync(process.cwd() + constant.TILE_NO_PNG);
            //添加坐标和缩放比
            let img = await Jimp.read(process.cwd() + constant.TILE_NO_PNG);
            let font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
            img.print(font, 5, 5, '( ' + x + ', ' + y + ',' + z + ' )');
            return new Promise((resolve, reject) => {
                img.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                    if(err) return reject(err);
                    resolve(buffer);
                });
            });
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