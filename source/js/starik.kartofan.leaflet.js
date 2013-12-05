"use strict"

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

L.TileLayerCache = L.TileLayer.extend({
    _imageToDataUri: function (image) {
        var canvas = window.document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        return canvas.toDataURL('image/png');
    },

    _tileOnLoadWithCache: function () {

        var mapCacheBase = this._layer.mapCacheBase;

        // var storage = this._layer.options.storage;
        if (mapCacheBase) {
            mapCacheBase.put({"_id": this._storageKey, "tile": this._layer._imageToDataUri(this)}, {}, function(err, data){
                console.log(err, data)
            });
        }
        L.TileLayer.prototype._tileOnLoad.apply(this, arguments);
    },

    _setUpTile: function (tile, key, value, cache) {
        tile._layer = this;

        if (cache) {
            tile._storageKey = key;
            tile.onload = this._tileOnLoadWithCache;
            tile.crossOrigin = 'Anonymous';
        } 
        else {
            tile.onload = this._tileOnLoad;
        }

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

        // console.log(this)

        // If chached
        // if (false) {
        if (opt.getOption("global", "mapCache")) {
            // mapCacheBase.get(key, function (value) {
            //     if (value) { parent._setUpTile(tile, key, value, false) } 
            //     else { parent._setUpTile(tile, key, parent.getTileUrl(tilePoint), true) }
            // }, function () {
            //     parent._setUpTile(tile, key, parent.getTileUrl(tilePoint), true);
            // });
            parent.mapCacheBase.get(key, function(err, data){
                if (err){
                    parent._setUpTile(tile, key, parent.getTileUrl(tilePoint), true)
                }
                if (data){
                    parent._setUpTile(tile, key, data.tile, false);
                }
                // console.log(err, data, tile, key, parent.getTileUrl(tilePoint))
            })
        } 
        // If no cache
        else {
            parent._setUpTile(tile, key, parent.getTileUrl(tilePoint), false);
        }
    }
 })

L.tileLayerCache = function(url, options){
    return new L.TileLayerCache(url, options)
 }

var LeafletMap = function(mapId){

    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    window.opt = new Options();
    window.mapvents = new Events();
    window.gps = new GPS();
    window.bases = new Bases();

    var parent = this;

    this.mapTilesLayer; // copy of LeafletTiles class
    this.marksLayer; 

    this.map;
    this.num = $(".maps").index($("#"+this.mapId));

    this.$map = $("#"+this.mapId);
    this.$allMaps = $("div.mapContainer > .maps")

    this.zoomControl;
    this.scaleControl;
    this.copyrightControl;
    this.nameControl;
    this.zoomLevelControl;

    this.crs;

    this.markerVizir;
    this.markerCursor;

    this.onFocusMap = function(){
        opt.setOption("current", "activeMap", mapId);
        opt.setOption("current", "activeMapNum", mapId.replace("map", ""));
        parent.$allMaps.removeClass("activemap");
        parent.$map.addClass("activemap");
     }

    this.moveAllMaps = function(latlng){
        for (var i = 0; i < parent.instances.length; i++) {
            parent.instances[i].setMapCenter(latlng);
        };        
     }

    this.onClickMap = function(e){
        if (e.originalEvent.button == 1){
            e.originalEvent.preventDefault();
            parent.moveAllMaps(e.latlng)
        }
     }

    this.onMapMoveEnd = function(e){
        if (!parent.map){return}

        var latlng = parent.map.getCenter();
        opt.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);   
        opt.setHash();
        
        if (opt.getOption("global", "mapSyncMoving")){
            parent.moveAllMaps(latlng);
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
            this.zoomLevelControl.setPrefix(this.map.getZoom());
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

     }

    this._validateLatLng = function(latlng){

        latlng = latlng ? latlng : opt.getOption("global", "mapDefaultCenterLatLng");

        try {
            latlng = L.latLng(latlng);
        }
        catch(e) {
            try {
                latlng = L.latLng(latlng.split(","));
            }
            catch(e) {
                latlng = this._validateLatLng(opt.getOption("global", "mapDefaultCenterLatLng"));
            }
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

        this.map.on("zoomend", function(e){ parent.onZoomEnd(); });
        // this.map.on("zoomend", this.onZoomEnd); // Srange but this not work in Chrome ??????
        this.map.on("dragend", this.onMapMoveEnd); // if I use moveend, on setting all maps position it`s fall to recursion a little
        // TODO: touch
        this.map.on("mousedown", this.onClickMap);
        this.map.on("focus", this.onFocusMap);
        this.map.on("mousemove", this.moveCursor);
        this.map.on("locationfound", gps.onGPS)
        this.map.on("locationerror", gps.errorGPS)

        this._setMapControls();
        this.updateMapControls();
        this.updateCurrentStageName();
        this.updateCurrentStageZoom();
        this.addVizir();
        this.addCursor();
     }

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

        bases.initBaseMapCache(this.mapTilesLayer.mapName);
     }

    this._setCRS = function(crs){

        crs = crs ? crs : "";

        switch (crs){
            case "EPSG3395":
                parent.crs = L.CRS.EPSG3395;
                break;
            case "EPSG3857.Ext":
                parent.crs = L.CRS.EPSG3857.Ext;
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
        this.map.invalidateSize();
     }

    this.addVizir = function(){
        if (!opt.getOption("global", "mapVizirVisible")){ return }

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
        if (!opt.getOption("global", "mapCursorAllMapsVisible")){ return }

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
            parent.instances[i].markerCursor.setOpacity(1.0);
            parent.instances[i].markerCursor.setLatLng(e.latlng);
        }; 

        parent.markerCursor.setOpacity(0.0);

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
 }

var LeafletTiles = function(mapName, mapData){

    var parent = this;

    this.mapName = mapName ? mapName : undefined;
    this.mapData = mapData ? mapData : undefined;

    this.layer;

    window.opt = new Options();
    window.mapvents = new Events();

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
            this.layer = L.tileLayer.wms(this.mapData.tilesURL, $.extend({
                maxZoom: this.mapData.maxZoom,
                minZoom: this.mapData.minZoom,
                layer: this.mapData.layer,
                mapName: mapName,
            }, tileLayerExtendKeys));
        }
        else {
            // this.layer = L.tileLayer(this.mapData.tilesURL, $.extend({
            this.layer = L.tileLayerCache(this.mapData.tilesURL, $.extend({
                maxZoom: this.mapData.maxZoom,
                minZoom: this.mapData.minZoom,
                mapName: mapName,
            }, tileLayerExtendKeys));
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

    this.setMap = function(mapName, mapData){
        mapName = mapName ? mapName : "";
        var activeMap = opt.getOption("current", "activeMap");

        window[activeMap].setMapTilesLayer(new LeafletTiles(mapName, mapData));
     }

    this.editMap = function(mapId){

        var maps = opt.getOption("maps");
        var activeMap = opt.getOption("current", "activeMap");
        var mapVals;

        // If no mapId get active map
        if (!mapId){
            mapVals = window[activeMap].mapTilesLayer.mapData;
            mapVals.id = window[activeMap].mapTilesLayer.mapName;
            console.log(mapVals.id, activeMap, window[activeMap].mapTilesLayer)
        }
        else {
            mapVals = opt.getOption("maps", mapId);
            mapVals.id = mapVals.id ? mapVals.id : mapId;
        }

        // Groups suggestions
        var mapOptions = {}
        var groups = $.pluck(maps, "group");
        groups = $.unique(groups);
        groups.sort()
        mapOptions.group = groups;        

        eform = new EditableForm(mapvents.mapEditForm);
        eform.fillForm(mapVals);
        eform.fillOptions(mapOptions);
     }     

    this._deleteMapFunc = function(form){
        form.getAllData(); 
        console.log(form.data)
        if (confirm(loc("editMaps:deleteMap", form.data.id))) {
            if (form.data.id){
                form.hideForm();
                opt.deleteOption("maps", form.data.id);
                console.log(form.data.id + "deleted")
            }
        }                    
     }

    this._submitMapFunc = function(form){
        form.getAllData(); 

        console.log(form)
        if (!form.checkForm){
            alert(loc("editMaps:errorCheckForm"));
            return;
        }

        if (opt.getOption("maps", form.data.id)){
            if (!confirm(loc("editMaps:mapRewriteConfirm", form.data.id))) {
                return;
            }
        }

        form.hideForm();
        opt.setOption("maps", form.data.id, form.data)
        console.log(form.data.id, opt.getOption("maps", form.data.id));            
     }

    // *************** JSON ****************
 
    this.getAllMapsJSON = function(url){
        if (!url){
            url = prompt(loc("editMaps:mapsJSONAdd"), opt.getOption("global", "externalFeeds")[0].url);
        }

        $.getJSON(url, function(data){

            try {
                data = JSON.parse(Base64.decode(data.content));
            }
            catch(e){}

            $.each(data.maps, function(i,v){
                if (opt.getOption("maps", i)){
                    if (!confirm(loc("editMaps:mapRewriteConfirm"))) {
                        return;
                    }
                }
                opt.setOption("maps", i, v);
            })
        }); 

     }

 }}());
