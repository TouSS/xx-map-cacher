/**
 * 大量点标注
 * @param {*} map 地图容器
 * @param {*} markers 点集合
 * @param {*} clickHandler 点击回掉
 * @param {*} icons 自定义图标集合
 * @see 使用时请引入pixi.overlay.min.js和tools.min.js
 */
function markerGroup(map, markers, clickHandler, icons) {
    var loader = new PIXI.loaders.Loader();
    //加载资源，初始化加载器
    //加载默认资源
    loader.add('default', '/imgs/circle.png').add('focusDefault', '/imgs/focus-circle.png');
    //加载自定义资源
    if(icons && icons.length > 0) {
        for(var i in icons) {
            loader.add(icons[i].name, icons[i].url);
        }
    }
    
    //拉取数据，然后渲染
    loader.load((loader, resources) => {
        //点标注渲染
        var pixiLayer = (() => {
            //是否初次渲染
            var firstDraw = true;
            //变化前缩放等级
            var prevZoom;
            //点集合
            var markerSprites = [];
            //取色色度
            var colorScale = d3.scaleLinear()
                .domain([0, 50, 100])
                .range(["#c6233c", "#ffd300", "#008000"]);
            //渲染对象
            var frame = null;
            //选中对象
            var focus = null;
            //标注容器
            var pixiContainer = new PIXI.Container();

            return L.pixiOverlay((utils) => {
                //当前缩放等级
                var zoom = utils.getMap().getZoom();
                //当前是否有以渲染的对象，有则取消掉
                if (frame) {
                    cancelAnimationFrame(frame);
                    frame = null;
                }
                //容器
                var container = utils.getContainer();
                //渲染器
                var renderer = utils.getRenderer();
                //经纬度转可用坐标点工具
                var latLngToLayerPoint = utils.latLngToLayerPoint;
                //比例
                var scale = utils.getScale();
                var invScale = 1 / scale;
                
                if (firstDraw) {
                    prevZoom = zoom;
                    markers.forEach((marker) => {
                        var coords = latLngToLayerPoint([marker.latitude, marker.longitude]);
                        var markerSprite = new PIXI.Sprite();
                        //是否自定义图标，无则使用默认图标
                        if(resources[marker.texture]) {
                            markerSprite.texture = resources[marker.texture].texture;
                        } else {
                            markerSprite.texture = resources['default'].texture;
                        }
                        if(resources[marker.focusTexture]) {
                            markerSprite.focusTexture = resources[marker.focusTexture].texture;
                        } else {
                            markerSprite.focusTexture = resources['focusDefault'].texture;
                        }
                        markerSprite.x0 = coords.x;
                        markerSprite.y0 = coords.y;
                        markerSprite.anchor.set(0.5, 0.5);
                        var tint = d3.color(colorScale(marker.avancement || Math.random() * 100)).rgb();
                        markerSprite.tint = 256 * (tint.r * 256 + tint.g) + tint.b;
                        container.addChild(markerSprite);
                        markerSprites.push(markerSprite);
                        markerSprite.target = marker;
                    });
                    var quadTrees = {};
                    for (var z = map.getMinZoom(); z <= map.getMaxZoom(); z++) {
                        var rInit = ((z <= 7) ? 16 : 24) / utils.getScale(z);
                        quadTrees[z] = window.solveCollision(markerSprites, {r0: rInit, zoom: z});
                    }
                    function findMarker(ll) {
                        var layerPoint = latLngToLayerPoint(ll);
                        var quadTree = quadTrees[utils.getMap().getZoom()];
                        var marker;
                        var rMax = quadTree.rMax;
                        var found = false;
                        quadTree.visit(function(quad, x1, y1, x2, y2) {
                            if (!quad.length) {
                                var dx = quad.data.x - layerPoint.x;
                                var dy = quad.data.y - layerPoint.y;
                                var r = quad.data.scale.x * 16;
                                if (dx * dx + dy * dy <= r * r) {
                                    marker = quad.data;
                                    found = true;
                                }
                            }
                            return found || x1 > layerPoint.x + rMax || x2 + rMax < layerPoint.x || y1 > layerPoint.y + rMax || y2 + rMax < layerPoint.y;
                        });
                        return marker;
                    }
                    function switchTexture(markerSprite) {
                        var tmpTexture = markerSprite.texture;
                        markerSprite.texture = markerSprite.focusTexture;
                        markerSprite.focusTexture = tmpTexture;

                    }
                    map.on('click', function(e) {
                        //不需要重画
                        var redraw = false;
                        //当前是否有已选中，有则还原标注图标
                        
                        if (focus) {
                            switchTexture(focus);
                            //重画
                            redraw = true;
                        }
                        //查找点击标注
                        var marker = findMarker(e.latlng);
                        if (marker) {
                            switchTexture(marker);
                            //选中
                            focus = marker;
                            clickHandler(marker.target);
                            //重画
                            redraw = true;
                        }
                        if (redraw) utils.getRenderer().render(container);
                    });
                    L.DomUtil.removeClass(map.getContainer(), 'leaflet-grab');
                    map.on('mousemove', L.Util.throttle(function(e) {
                        var marker = findMarker(e.latlng);
                        if (marker) {
                            L.DomUtil.addClass(map.getContainer(), 'leaflet-interactive');
                        } else {
                            L.DomUtil.removeClass(map.getContainer(), 'leaflet-interactive');
                        }
                    }, 32));
                }
                
                if (firstDraw || prevZoom !== zoom) {
                    markerSprites.forEach(function(markerSprite) {
                        var position = markerSprite.cache[zoom];
                        if (firstDraw) {
                            markerSprite.x = position.x;
                            markerSprite.y = position.y;
                            markerSprite.scale.set((position.r * scale < 16) ? position.r / 16 : invScale);
                        } else {
                            markerSprite.currentX = markerSprite.x;
                            markerSprite.currentY = markerSprite.y;
                            markerSprite.targetX = position.x;
                            markerSprite.targetY = position.y;
                            markerSprite.currentScale = markerSprite.scale.x;
                            markerSprite.targetScale = (position.r * scale < 16) ? position.r / 16 : invScale;
                        }
                    });
                }
                
                var start = null;
                var delta = 250;
                function animate(timestamp) {
                    var progress;
                    if (start === null) start = timestamp;
                    progress = timestamp - start;
                    var lambda = progress / delta;
                    if (lambda > 1) lambda = 1;
                    lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
                    markerSprites.forEach(function(markerSprite) {
                        markerSprite.x = markerSprite.currentX + lambda * (markerSprite.targetX - markerSprite.currentX);
                        markerSprite.y = markerSprite.currentY + lambda * (markerSprite.targetY - markerSprite.currentY);
                        markerSprite.scale.set(markerSprite.currentScale + lambda * (markerSprite.targetScale - markerSprite.currentScale));
                    });
                    renderer.render(container);
                    if (progress < delta) {
                        frame = requestAnimationFrame(animate);
                    }
                }
                if (!firstDraw && prevZoom !== zoom) {
                    frame = requestAnimationFrame(animate);
                }
                firstDraw = false;
                prevZoom = zoom;
                renderer.render(container);
            }, pixiContainer);
        })();
        //添加到地图上
        pixiLayer.addTo(map);
    });
}