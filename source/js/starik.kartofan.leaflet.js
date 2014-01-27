"use strict"

L.LatLng.prototype.toNormalString = function() {
    return this.lat + ', ' + this.lng;
 }

L.CRS.EPSG3857.Ext = L.extend({}, L.CRS, {

    code: 'EPSG:3857.Ext',

    projection: {
        MAX_LATITUDE: 85.0511287798,
        dX: 0,
        dY: 0,

        project: function(latlng) { // (LatLng) -> Point
            var d = L.LatLng.DEG_TO_RAD,
                max = this.MAX_LATITUDE,
                lat = Math.max(Math.min(max, latlng.lat), -max) + this.dY,
                lng = latlng.lng + this.dX,
                x = lng * d,
                y = lat * d;

            y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));
            return new L.Point(x, y);
        },

        unproject: function(point) { // (Point, Boolean) -> LatLng
            var d = L.LatLng.RAD_TO_DEG,
                lng = (point.x) * d,
                lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

            lat = lat - this.dY;
            lng = lng - this.dX;

            return new L.LatLng(lat, lng);
        }
     },

    transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

 });

L.Control.Measure = L.Control.Measure.extend({
    onAdd: function (map) {
        var className = 'leaflet-control-zoom leaflet-bar leaflet-control',
            container = L.DomUtil.create('div', className);
        return container;
     },

    _updateTooltipDistance: function(total, difference) {
        var totalRound = this._round(total),
            differenceRound = this._round(difference);

        var text;
        if (totalRound<1000){
            text = '<div class="leaflet-measure-tooltip-total">' + totalRound + ' m</div>';
        }
        else {
            text = '<div class="leaflet-measure-tooltip-total">' + (totalRound/1000).toFixed(2) + ' km</div>';
        }

        text += '<div class="leaflet-measure-tooltip-difference">(+' + differenceRound + ' m)</div>';

        this._tooltip._icon.innerHTML = text;
     },

    _round: function(val) {
        return Math.round(val)
     },   
 })

L.TileLayerCache = L.TileLayer.extend({

    _storeTile: function(x, y, z, base, url){
        // console.log(x, y, z, base, url)

        if (!x && !y && !z && !base && !url){ return }

        var parent = this;
        
        window.opt = new Options();

        $.getJSON(opt.getOption("global", "mapCachedService")+"?url="+ escape(url) + "&x="+x+"&y="+y+"&z="+z+"&base="+base+"&callback=?", function(data){
            if(data){
                parent.mapCacheBase.put({"_id": x+','+y+','+z, "tile": data}, {}, function(err, data){
                    console.log(err, data)
                });                    
            }
        })
     },

    _setUpTile: function (tile, value) {

        tile._layer = this;
        tile.onload = this._tileOnLoad;
        tile.onerror = this._tileOnError;
        tile.src = value;
     },

    _loadTile: function (tile, tilePoint) {

        window.bases = new Bases();
        window.opt = new Options();

        this._adjustTilePoint(tilePoint);
        var key = tilePoint.x + ',' + tilePoint.y + ',' + tilePoint.z;

        var parent = this;

        this.mapCacheBase = bases.mapCache["map_"+this.options.mapName];

        var flag = opt.getOption("current", "mapCacheLoad") || "internet";
                
        console.log(flag)

        // If chached
        if (opt.getOption("current", "mapCache") && this.mapCacheBase) {
            
            if (flag == "cache") {
                parent.mapCacheBase.get(key, function(err, data){
                    if (data && data.tile){
                        parent._setUpTile(tile, data.tile);
                    }
                })  
            }

            // Get tiles from cache
            // If not exist load from internet
            if (flag == "cache+internet") {
                parent.mapCacheBase.get(key, function(err, data){

                    if (data && data.tile){
                        parent._setUpTile(tile, data.tile);
                    }
                    if (err){
                        parent._setUpTile(tile, parent.getTileUrl(tilePoint))
                    }
                })    
            }

            // Get tiles from internet
            // Then check tiles in base and if it`s not exist caching it
            if (flag == "internet+cache") {

                parent._setUpTile(tile, parent.getTileUrl(tilePoint))

                parent.mapCacheBase.get(key, function(err, data){
                    // console.log(err, data)
                    if (err){
                        parent._storeTile(tilePoint.x, tilePoint.y, tilePoint.z, parent.options.mapName, parent.getTileUrl(tilePoint));
                    }
                })  
            }      

            if (flag == "internet") {
                parent._setUpTile(tile, parent.getTileUrl(tilePoint));            
            }  
        } 
        // If no cache
        else {
            parent._setUpTile(tile, parent.getTileUrl(tilePoint));
        }
     }
 })

L.TileLayerCache.WMS = L.TileLayerCache.extend({

    defaultWmsParams: {
        service: 'WMS',
        request: 'GetMap',
        version: '1.1.1',
        layers: '',
        styles: '',
        format: 'image/jpeg',
        transparent: false
     },

    initialize: function (url, options) { // (String, Object)

        this._url = url;

        var wmsParams = L.extend({}, this.defaultWmsParams),
            tileSize = options.tileSize || this.options.tileSize;

        if (options.detectRetina && L.Browser.retina) {
            wmsParams.width = wmsParams.height = tileSize * 2;
        } else {
            wmsParams.width = wmsParams.height = tileSize;
        }

        for (var i in options) {
            // all keys that are not TileLayer options go to WMS params
            if (!this.options.hasOwnProperty(i) && i !== 'crs' && i !== "mapName" && !tileLayerExtendKeys.hasOwnProperty(i)) {
                wmsParams[i] = options[i];
            }
        }

        this.wmsParams = wmsParams;

        L.setOptions(this, options);
     },

    onAdd: function (map) {

        this._crs = this.options.crs || map.options.crs;

        this._wmsVersion = parseFloat(this.wmsParams.version);

        var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
        this.wmsParams[projectionKey] = this._crs.code;

        L.TileLayer.prototype.onAdd.call(this, map);
     },

    getTileUrl: function (tilePoint) { // (Point, Number) -> String

        var map = this._map,
            tileSize = this.options.tileSize,

            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add([tileSize, tileSize]),

            nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
            se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
            bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
                [se.y, nw.x, nw.y, se.x].join(',') :
                [nw.x, se.y, se.x, nw.y].join(','),

            url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});

        // console.log(this.wmsParams)

        return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
     },

    setParams: function (params, noRedraw) {

        L.extend(this.wmsParams, params);

        if (!noRedraw) {
            this.redraw();
        }

        return this;
     }
 })

L.tileLayerCache = function(url, options){
    return new L.TileLayerCache(url, options)
 }

L.tileLayerCache.wms = function(url, options){
    return new L.TileLayerCache.WMS(url, options)
 }

var LeafletMap = function(mapId){

    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    window.opt = new Options();
    window.gps = new GPS();
    window.bases = new Bases();
    window.infomenu = new InfoMenu();

    var parent = this;

    this.mapTilesLayer; // copy of LeafletTiles class
    this.marksLayer; 

    this.map;

    this.markers = new Markers();
    this.markersLayers = {};

    this.num = $(".maps").index($("#"+this.mapId));

    this.$map = $(".maps#"+this.mapId);

    this.zoomControl;
    this.scaleControl;
    this.copyrightControl;
    this.nameControl;
    this.zoomLevelControl;

    this.measureControl;

    this.crs;

    this.markerVizir;
    this.markerCursor;

    this.zoomBlock = opt.getOption("current", "stage").stageMapsZoomsBlock ? opt.getOption("current", "stage").stageMapsZoomsBlock[this.num] : false;

    this.removeActiveClass = function() {
        for (var i = 0; i < parent.instances.length; i++) {
            parent.instances[i].$map.removeClass("activemap");
        }; 
     }

    this.onFocusMap = function(){
        opt.setOption("appVars", "activeMap", mapId);
        opt.setOption("appVars", "activeMapNum", mapId.replace("map", ""));
        parent.removeActiveClass();
        parent.$map.addClass("activemap");
     }

    this.onMouseDownMap = function(e){

        opt.setOption("appVars", "cursorLatLng", e.latlng);
        infomenu.setCoords(e.latlng);

        if (e.originalEvent.button === 1){
            e.originalEvent.preventDefault();
            parent.moveAllMaps(e.latlng)
        }
        if (e.originalEvent.button !== 2){
            topmenu.hideTopMenuView();
        }
     }

    this.onClickMap = function(e){
        topmenu.hideTopMenuView();

        opt.setOption("appVars", "cursorLatLng", e.latlng);
        infomenu.setCoords(e.latlng);

        // Add Markers
        if (opt.getOption("appVars", "markerAddModeOn")){
            parent.markers.editMarkerForm();
            opt.setAddMarkerOff();
        }
     }

    this.onMapMoveEnd = function(e){
        if (!parent.map){return}

        var latlng = parent.map.getCenter();
        
        parent.moveAllMaps(latlng);
     }

    this.moveAllMaps = function(latlng){
        latlng = this._validateLatLng(latlng);
        opt.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);  
        opt.setHash(); 

        if (opt.getOption("current", "mapSyncMoving")){
            for (var i = 0; i < parent.instances.length; i++) {
                parent.instances[i].setMapCenter(latlng);
            };  
        }   
     }

    this.onZoomEnd = function(e){
        if (!parent.map) { return }
        this.setMapZoom(parent.map.getZoom());
        this.onMapMoveEnd();
        this.updateCurrentStageZoom();
     }

    this.updateMapControls = function(){
        if (!this.map) { return }

        if (this.zoomLevelControl){
            var prefixZoom = this.map.getZoom();
            this.zoomBlock ? prefixZoom += "(×)" : undefined;
            this.zoomLevelControl.setPrefix(prefixZoom);
        }

        var title;
        try { title = this.mapTilesLayer.mapData.title; }
        catch (e) { title = "No title" }

        if (this.nameControl){
            this.nameControl.setPrefix(title);
        }
     }

    this.updateCurrentStageName = function(){
        if (!this.map){ return }
        var currStage = opt.getOption("current", "stage");
        var name = this.mapTilesLayer.mapName;

        // If map deleted before it must get out from current stage
        name = opt.getOption("maps")[name] ? name : "unknown";

        currStage.stageMapsNames[parent.num] = name;
        opt.setOption("current", "stage", currStage);
     }

    this.updateCurrentStageZoom = function(){
        if (!this.map){ return }
        var currStage = opt.getOption("current", "stage");
        var zoom = parent.map.getZoom();

        currStage.stageMapsZooms[parent.num] = zoom;
        opt.setOption("current", "stage", currStage);
     }

    this.removeAllControls = function(){
        if (!this.map){ return }
        if (this.zoomControl) { try{this.map.removeControl(parent.zoomControl)}catch(e){} }
        if (this.scaleControl) { try{this.map.removeControl(parent.scaleControl)}catch(e){} }
        if (this.copyrightControl) { try{this.map.removeControl(parent.copyrightControl)}catch(e){} }
        if (this.nameControl) { try{this.map.removeControl(parent.nameControl)}catch(e){} }
        if (this.zoomLevelControl) { try{this.map.removeControl(parent.zoomLevelControl)}catch(e){} }
     }

    this._setMapControls = function(){

        if (!this.map){ return }
        // Controls params from current stage
        var currStage = opt.getOption("current", "stage");
        var ctrls = currStage.stageMapsControlls[parent.num];

        if (!ctrls) { return }

        // Zoom Control
        if (ctrls.zoom){
            this.zoomControl = L.control.zoom(ctrls.zoom.pos ? ctrls.zoom.pos : "topleft")
            this.map.addControl(this.zoomControl);            
         }

        // Scale Control
        if (ctrls.scale){
            this.scaleControl = L.control.scale({
                position: ctrls.scale.pos ? ctrls.scale.pos : "bottomleft",
                imperial: ctrls.scale.miles ? ctrls.scale.miles : false,
            })
            this.map.addControl(this.scaleControl);            
         }        

        // Cporyright
        if (ctrls.infoCopyright && ctrls.infoCopyright.text){
            this.copyrightControl = L.control.attribution({
                position: ctrls.infoCopyright.pos ? ctrls.infoCopyright.pos : "bottomright",
                prefix: ctrls.infoCopyright.text,
            })
            this.map.addControl(this.copyrightControl);          
         }  

        // Map Title
        if (ctrls.mapTitle){
            var title;
            try { title = this.mapTilesLayer.mapData.title }
            catch (e) { title = "No title" }

            this.nameControl = L.control.attribution({
                position: ctrls.mapTitle.pos ? ctrls.mapTitle.pos : "bottomright",
                prefix: title,
            })
            this.map.addControl(this.nameControl);        
         }  

        // Zoom Level
        if (ctrls.zoomLevel){
            this.zoomLevelControl = L.control.attribution({
                position: ctrls.zoomLevel.pos ? ctrls.zoomLevel.pos : "bottomright",
                prefix: this.map.getZoom(),
            })
            this.map.addControl(this.zoomLevelControl);
         }                   

        // Measure Control
        this.measureControl = new L.Control.Measure({});
        this.map.addControl(this.measureControl);

     }

    this._validateLatLng = function(latlng){
        latlng = latlng ? latlng : opt.getOption("global", "mapDefaultCenterLatLng");

        try {
            if (typeof latlng == "object") {
                latlng = L.latLng(latlng)
            }
            else {
                latlng = L.latLng(latlng.replace(/s+/, "").split(","));
            }
        }
        catch(e) {
            latlng = parent._validateLatLng(opt.getOption("global", "mapDefaultCenterLatLng"));
        }

        return latlng;
     }

    this._validateZoom = function(zoom){

        var minZoom = 0;
        var maxZoom = 20;

        if (this.mapTilesLayer){ 
            minZoom = this.mapTilesLayer.mapData.minZoom;
            maxZoom = this.mapTilesLayer.mapData.maxZoom;            
        }

        zoom = zoom ? zoom : opt.getOption("global", "mapDefaultZoom");
        zoom = zoom>=minZoom && zoom<=maxZoom ? zoom : opt.getOption("global", "mapDefaultZoom");

        return zoom;

     }

    this.createMap = function(latlng, zoom){
        zoom = zoom || opt.getOption("current", "mapZoom") || opt.getOption("global", "mapDefaultZoom");
        zoom = this._validateZoom(zoom);

        latlng = latlng || opt.getOption("current", "mapCenterLatLng") || opt.getOption("global", "mapDefaultCenterLatLng");
        latlng = this._validateLatLng(latlng);

        if (this.mapTilesLayer){
            this._setCRS(this.mapTilesLayer.mapData.crs);
        }

        this.map = L.map(this.mapId, {
            zoomControl: false,
            attributionControl: false,
            center: latlng,
            zoom: zoom,
            inertia: false,
            doubleClickZoom: false,
            crs: parent.crs,
        });

        if (this.mapTilesLayer.layer){
            this.map.addLayer(this.mapTilesLayer.layer);
        }

        this.markers.setMap(this);
        this.markers.showMarkers();

        this.setEvents();
        this._setMapControls();
        this.updateMapControls();
        this.updateCurrentStageName();
        this.updateCurrentStageZoom();
        this.addVizir();
        this.addCursor();
        this.setCoordsCorrectionFlag();
     }

    this.setEvents = function() {
        
        if (this.zoomBlock) {
            this.map.touchZoom.disable();
            this.map.scrollWheelZoom.disable();
        };

        this.map.on("zoomend", function(e){ parent.onZoomEnd() });
        // this.map.on("zoomend", this.onZoomEnd); // Srange but this not work in Chrome ??????
        this.map.on("dragend", this.onMapMoveEnd); // if I use moveend, on setting all maps position it`s fall to recursion a little
        // TODO: touch
        this.map.on("mousedown", this.onMouseDownMap);
        this.map.on("focus", this.onFocusMap);
        this.map.on("mousemove", this.moveCursor);
        this.map.on("locationfound", gps.onGPS);
        this.map.on("locationerror", gps.errorGPS);
        // this.map.on("resize", this.refreshMapAfterResize);   
        this.map.on("contextmenu", topmenu.showTopMenuView);   
        this.map.on("click", this.onClickMap);
     }

    this.setCoordsCorrectionFlag = function() {
        if (parent.mapTilesLayer.mapData.dX || parent.mapTilesLayer.mapData.dY) {
            parent.$map.addClass("coordscorrection");
        }
     };

    this.setMapCenter = function(latlng){
        if (!this.map){return}
        latlng = this._validateLatLng(latlng);
        this.map.panTo(latlng);
        this.markerVizir.setLatLng(latlng);
        this.updateMapControls();
     }

    this.setMapZoom = function(zoom){
        if (!this.map){return}
        zoom = this._validateZoom(zoom);
        this.map.setZoom(zoom);
        this.updateMapControls();
     }

    this.setMapView = function(latlng, zoom){
        if (!this.map){return}
        latlng = this._validateLatLng(latlng);
        zoom = this._validateZoom(zoom);
        this.map.setView(latlng, zoom);
     }
    
    this.setMapTilesLayer = function(layerObj){

        bases.initBaseMapCache(layerObj.mapName);

        if (this.map){
            this.map.removeLayer(this.mapTilesLayer.layer)
        }

        this.mapTilesLayer = layerObj;
        this._setCRS(this.mapTilesLayer.mapData.crs);

        // When update tiles layer
        if (this.map){
            this.map.addLayer(this.mapTilesLayer.layer);
            this.updateMapControls();
        }

        this.updateCurrentStageName();
        this.updateCurrentStageZoom();

     }

    this._setCRS = function(crs){

        crs = crs ? crs : "";

        switch (crs){
            case "EPSG3395":
                parent.crs = L.CRS.EPSG3395;
                break;
            case "EPSG3857.Ext":
                parent.crs = L.CRS.EPSG3857.Ext;
                parent.crs.projection.dX = parent.mapTilesLayer.mapData.dX ? parent.mapTilesLayer.mapData.dX : 0;
                parent.crs.projection.dY = parent.mapTilesLayer.mapData.dY ? parent.mapTilesLayer.mapData.dY : 0;
                break;
            default:
                parent.crs = L.CRS.EPSG3857
                break;
        }

        if (this.map){
            this.map.options.crs = parent.crs;
            this.moveAllMaps(opt.getOption("current", "mapCenterLatLng"));
        }
     }
    
    this.refreshMapAfterResize = function(){
        parent.map.invalidateSize();
        console.log("leafler resize");
     }

    this.addVizir = function(){
        
        var iconVizir = L.icon({
            iconUrl: 'images/vizir_32x32.png',
            iconSize: [32, 10],
            iconAnchor: [16, 0],
        });

        this.markerVizir = L.marker(
            opt.getOption("current", "mapCenterLatLng"), 
            {
                icon: iconVizir,
                clickable: false
            }
        );
        this.markerVizir.addTo(this.map);
     }

    this.addCursor = function(){
        if (!opt.getOption("current", "mapCursorAllMapsVisible")){ return }

        var iconCursor = L.icon({
            iconUrl: 'images/cursorAllMaps_32x32.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        this.markerCursor = L.marker(
            opt.getOption("current", "mapCenterLatLng"), 
            {
                icon: iconCursor,
                clickable: false
            }
        );

        this.markerCursor.addTo(this.map);

     }

    this.moveCursor = function(e){

        for (var i = 0; i < parent.instances.length; i++) {
            if (parent.instances[i].markerCursor){
                parent.instances[i].markerCursor.setOpacity(1.0);
                parent.instances[i].markerCursor.setLatLng(e.latlng);
            }
        }; 

        if (parent.markerCursor){
            parent.markerCursor.setOpacity(0.0);
        }

        opt.setOption("appVars", "cursorLatLng", e.latlng);
        infomenu.setCoords(e.latlng);
     }

    this.instances.push(this);

 }

LeafletMap.prototype.instances = []; // Collect all instanses of class

var tileLayerExtendKeys = {
    case1234: function(data){return [1,2,3,4][Math.floor(Math.random() * 4)]},
    Gagarin: function(data){return "Gagarin".substr(0, Math.round("Gagarin".length * Math.random()))},
    case0123: function(data){return [0,1,2,3][Math.floor(Math.random() * 4)]},
    Galileo: function(data){return "Galileo".substr(0, Math.round("Galileo".length * Math.random()))},
    z17: function(data){return 17-data.z},
    rosreestr: function(data){
        var text = "";
        var x2 = Dec2Bin(data.x);
        var y2 = Dec2Bin(data.y);
        var x0 = "";
        var y0 = "";

        for (var i = 1; i <= data.z - x2.length; i++) {
            x0 += "0";
        }
        x2 = x0 + x2;

        for (var i = 1; i <= data.z - y2.length; i++) {
            y0 += "0";
        }
        y2 = y0 + y2;

        for (var i = 7; i <= data.z; i++) {
            text += y2.substr(0, i - 6) + "-" + x2.substr(0, i - 6) + "/";
        }
        text += y2 + "-" + x2;

        // console.log(text)

        return text;
     },
    bingBird: function(data) {
        var res = "";
        var osX = Math.floor(Math.round(Math.pow(2, data.z)) / 2);
        var osY = Math.floor(Math.round(Math.pow(2, data.z)) / 2);
        var prX = osX;
        var prY = osY;
        for (var i = 2; i <= data.z + 1; i++) {
            prX = Math.floor(prX / 2);
            prY = Math.floor(prY / 2);
            if (data.x < osX) {
                osX = osX - prX;
                if (data.y < osY) {
                    osY = osY - prY;
                    res += '0';
                } else {
                    osY = osY + prY;
                    res += '2';
                }
            } else {
                osX = osX + prX;
                if (data.y < osY) {
                    osY = osY - prY;
                    res += '1';
                } else {
                    osY = osY + prY;
                    res += '3';
                }
            }
        }
        return res;
     },
    bboxGenshtab: function(data){
        console.log(this)
    }
 }

var LeafletTiles = function(mapName, mapData){

    var parent = this;

    this.mapName = mapName ? mapName : undefined;
    this.mapData = mapData ? mapData : undefined;

    this.layer;

    window.opt = new Options();

    // TODO: сделать проверку что это строка и ссылка
    this._validateTilesURL = function(url){
        return url ? url : opt.getOption("global", "mapDefaultURL");
     }

    this._validateServer = function(server){
        return server && ["img", "wms"].indexOf(server)>-1 ? server : "img";
     }

    this._validateMinZoom = function(minZoom){
        minZoom = parseInt(minZoom, 10);
        minZoom = minZoom<=18 && minZoom>0 ? minZoom : minZoom>18 ? 18 : 1; // If return 0 exept 1 all crashed
        return minZoom;
     }

    this._validateMaxZoom = function(maxZoom){
        maxZoom = parseInt(maxZoom, 10);
        maxZoom = maxZoom<=18 && maxZoom>0 ? maxZoom : 18;
        return maxZoom;
     }

    this._validateStartZoom = function(startZoom){
        startZoom = parseInt(startZoom, 10);
        startZoom = startZoom<=18 && startZoom>0 ? startZoom : opt.getOption("global", "mapDefaultZoom");
        return startZoom;
     }     

    this._validateZoomBounds = function(){
        if (!this.mapData.maxZoom || !this.mapData.minZoom) { return }

        if (this.mapData.maxZoom < this.mapData.minZoom) {
            this.mapData.maxZoom = this.mapData.minZoom;
        }
     }

    this._setLayerOptions = function(){

        if (this.mapData.server && this.mapData.server === "wms"){
            if (!this.mapData.layer) { return }
            this.layer = L.tileLayerCache.wms(this.mapData.tilesURL, $.extend({
                maxZoom: this.mapData.maxZoom,
                minZoom: this.mapData.minZoom,
                layers: this.mapData.layer,
                mapName: mapName,
            }, tileLayerExtendKeys));
        }
        else {
            // this.layer = L.tileLayer(this.mapData.tilesURL, $.extend({
            this.layer = L.tileLayerCache(this.mapData.tilesURL, $.extend({
                maxZoom: this.mapData.maxZoom,
                minZoom: this.mapData.minZoom,
                mapName: mapName,
            }, tileLayerExtendKeys, parent));
        }
     }

    this.setLayer = function(mapName, mapData){

        this.mapName = mapName ? mapName : this.mapName ? this.mapName : "unknown";

        this.mapData = mapData ? mapData : this.mapData ? this.mapData : opt.getOption("maps", this.mapName) ? opt.getOption("maps", this.mapName) : {};

        if (!this.mapData) { return }

        this.mapData.server = this._validateServer(this.mapData.server);
        this.mapData.tilesURL = this._validateTilesURL(this.mapData.tilesURL);
        this.mapData.maxZoom = this._validateMaxZoom(this.mapData.maxZoom);
        this.mapData.minZoom = this._validateMinZoom(this.mapData.minZoom);
        this.mapData.startZoom = this._validateStartZoom(this.mapData.startZoom);
        this.mapData.title = this.mapData.title ? this.mapData.title : "Unknown Map";

        this._validateZoomBounds();

        this._setLayerOptions();
     }

    this.setLayer();

 }

var MapsEditor = (function(){

    var instance;

    return function Construct_singletone () {
        if (instance) {
            return instance;
        }
        if (this && this.constructor === Construct_singletone) {
            instance = this;
        } else {
            return new Construct_singletone();
        }

    var parent = this;

    window.opt = new Options();
    window.stage = new StageMaps();

    this.setMap = function(mapName, mapData){
        mapName = mapName ? mapName : "";
        var activeMapNum = opt.getOption("appVars", "activeMapNum");

        mapsInstance[activeMapNum].setMapTilesLayer(new LeafletTiles(mapName, mapData));
     }

    this.setMapMenu = function() {
        var arr = opt._createMenuArrFromBase("maps");
        console.log(arr)
        $.each(arr, function(g, group){
            $.each(group, function(i, v){
                arr[g][i].callback = function(i){parent.setMap(i)};
                arr[g][i].title = opt.getOption("maps", i).title;
            })
        })
        var menu = new AccordionMenu(arr);
     }

    this.externalMapMenu = function(url) {

        url = typeof url == "string" ? url : prompt(loc("jsonImport:jsonAdd"), opt.getOption("global", "mainFeed"));

        $.getJSON(url, function(data){
            try { data = JSON.parse(Base64.decode(data.content)) }
            catch(e){}

            var arr = opt._createMenuArrFromBase("", data.maps);

            $.each(arr, function(g, group){
                $.each(group, function(i, v){
                    arr[g][i] = data.maps[i];
                    arr[g][i].callback = function(i){parent.setMap(i, arr[g][i])};
                })
            })
            var menu = new AccordionMenu(arr);
        })
     }

    this.editMap = function(mapId, vals) {

        var maps = opt.getOption("maps");

        var vals = vals ? vals : opt.getOption("maps", mapId);
        vals.id = vals.id ? vals.id : mapId;

        // Groups suggestions
        var groups = $.unique($.pluck(maps, "group"));
        groups.sort();

        var arr = [
            { "type": "formEditMap_id",        "name": "id", "val": vals.id, "loc": "editMaps:formEditMap_id", "description": "id"},
            { "type": "formEditMap_title",     "name": "title", "val": vals.title, "loc": "editMaps:formEditMap_title", "description": "title" },
            { "type": "formEditMap_server",    "name": "server", "val": vals.server || "img", "options": ["img", "wms"], "loc": "editMaps:formEditMap_server", "description": "server" },
            { "type": "formEditMap_layers",    "name": "layers", "val": vals.layers, "loc": "editMaps:formEditMap_layers", "description": "layer" },
            { "type": "formEditMap_group",     "name": "group", "val": vals.group, "options": groups, "loc": "editMaps:formEditMap_group", "description": "group" },
            { "type": "formEditMap_src",       "name": "src", "val": vals.src || "Internet", "options": ["Internet", "Storage", "Local"], "loc": "editMaps:formEditMap_src", "description": "src"},
            { "type": "formEditMap_crs",       "name": "crs", "val": vals.crs, "options": ["", "EPSG3857", "EPSG3857.Ext", "EPSG3395", "Simple"], "loc": "editMaps:formEditMap_crs", "description": "CRS" },
            { "type": "formEditMap_tilesURL",  "name": "tilesURL", "val": vals.tilesURL, "loc": "editMaps:formEditMap_tilesURL", "description": "tilesURL" },
            { "type": "formEditMap_maxZoom",   "name": "maxZoom", "val": vals.maxZoom, "loc": "editMaps:formEditMap_maxZoom", "description": "maxZoom" },
            { "type": "formEditMap_minZoom",   "name": "minZoom", "val": vals.minZoom, "loc": "editMaps:formEditMap_minZoom", "description": "minZoom" },
            { "type": "formEditMap_startZoom", "name": "startZoom", "val": vals.startZoom, "loc": "editMaps:formEditMap_startZoom", "description": "startZoom" },
            { "type": "formEditMap_submit", "loc": "editMaps:formEditMap_submit", callback: function(form){
                if (!form.checkFormFlag){
                    alert(loc("editMaps:errorCheckForm"));
                    return;
                } else {
                    mapseditor.submitMapFunc(form.data);
                    form.hideForm();
                }
            }},
            { "type": "formEditMap_delete", "loc": "editMaps:formEditMap_delete", callback: function(form){
                mapseditor.deleteMapFunc(form.data, function(){eform.hideForm()});
            }},
            { "type": "formEditMap_cancel", "loc": "editMaps:formEditMap_cancel", callback: function(form){
                form.hideForm();
            }},
        ];

        var eform = new FoundationForm(arr, "formEditMap");
     }     

    this.editMapMenu = function() {
        var arr = opt._createMenuArrFromBase("maps");
        $.each(arr, function(g, group){
            $.each(group, function(i, v){
                arr[g][i].callback = function(i){parent.editMap(i)};
                arr[g][i].title = opt.getOption("maps", i).title;
            })
        })
        var menu = new AccordionMenu(arr);
     }

    this.editMapActiveWindow = function() {
        var activeMapNum = opt.getOption("appVars", "activeMapNum");
        var mapVals = mapsInstance[activeMapNum].mapTilesLayer.mapData;
        mapVals.id = mapsInstance[activeMapNum].mapTilesLayer.mapName;

        console.log(mapVals.id, activeMapNum, mapsInstance[activeMapNum].mapTilesLayer);

        parent.editMap("", mapVals);
     }

    this.deleteMapFunc = function(data, callback){
        if (confirm(loc("editMaps:confirmDeleteMap", data.id))) {
            if (data.id){
                opt.deleteOption("maps", data.id);
                callback();
                console.log(data.id + " deleted")
            }
        }                    
     }

    this.submitMapFunc = function(data){
        if (opt.getOption("maps", data.id)){
            if (!confirm(loc("editMaps:confirmRewriteMap", data.id))) {
                return;
            }
        }

        opt.setOption("maps", data.id, data)
        console.log(data.id, opt.getOption("maps", data.id));            
     }

    this.toggleFullScreen = function(){

        if (opt.getOption("appVars", "fullScreenStage")){
            var fullStage = opt.getOption("appVars", "fullScreenStage");
            var prevStage = opt.getOption("appVars", "prevStage");
            var currStage = opt.getOption("current", "stage");

            // console.log(JSON.stringify(fullStage) == JSON.stringify(currStage))

            if (JSON.stringify(fullStage.stageMapsGrid) == JSON.stringify(currStage.stageMapsGrid) &&
                JSON.stringify(fullStage.stageMapsNames) == JSON.stringify(currStage.stageMapsNames) &&
                JSON.stringify(fullStage.stageMapsControlls) == JSON.stringify(currStage.stageMapsControlls))
            {
                opt.setOption("current", "stage", prevStage);
            } 

            opt.deleteOption("appVars", "fullScreenStage");
            opt.deleteOption("appVars", "prevStage");

        }
        else {
            var activeMapNum = opt.getOption("appVars", "activeMapNum");
            var currStage = opt.getOption("current", "stage");

            opt.setOption("appVars", "prevStage", currStage);
            var fullStage = {};

            $.each(currStage, function(i, v){
                fullStage[i] = $.isArray(v) ? [v[activeMapNum]] : v;
            })

            fullStage.tags = "";
            fullStage.title = "1 x 1";
            fullStage.id = "1x1";
            fullStage.stageMapsGrid = [[0,0,100,100]];

            opt.setOption("current", "stage", fullStage);
            opt.setOption("appVars", "fullScreenStage", JSON.parse(JSON.stringify(fullStage)));
        }

        stage.createStage();

     }

    this.toggleMeasuring = function() {
        opt.setOption("appVars", "measuringOn", !!(1 - opt.getOption("appVars", "measuringOn")));

        if (opt.getOption("appVars", "measuringOn")){
            $.each(mapsInstance, function(i, v){
                v.measureControl._startMeasuring();
            });    
            $(".topMenuUtilsToggleMeasuring").parent().addClass("active");
        }
        else {
            $.each(mapsInstance, function(i, v){
                v.measureControl._stopMeasuring();
            });             
            $(".topMenuUtilsToggleMeasuring").parent().removeClass("active");
        }
     }

 }}());
