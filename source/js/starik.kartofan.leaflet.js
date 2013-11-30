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
                lat = Math.max(Math.min(max, latlng.lat), -max),

                lat = lat + this.dY;
            lng = latlng.lng + this.dX;

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

var LeafletMap = function(mapId){

    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    if (typeof opt === "undefined" || !(opt instanceof Options)) { 
        window.opt = new Options();
        opt = window.opt;
     }

    if (typeof mapvents === "undefined" || !(mapvents instanceof Events)) { 
        window.mapvents = new Events();
        mapvents = window.mapvents;
     }

    var parent = this;

    this.mapTilesLayer; // copy of LeafletTiles class
    this.marksLayer; 

    this.map;

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
        var num = $(".maps").index($("#"+parent.mapId));

        currStage.stageMapsNames[num] = name;
        opt.setOption("current", "stage", currStage);
     }

    this.updateCurrentStageZoom = function(){
        if (!this.map){ return }
        var currStage = opt.getOption("current", "stage");
        var zoom = parent.map.getZoom();
        var num = $(".maps").index($("#"+parent.mapId));

        currStage.stageMapsZooms[num] = zoom;
        opt.setOption("current", "stage", currStage);
     }

    this._setMapControls = function(){

        if (!this.map) { return }

        // Zoom Control
        if (opt.getOption("global", "viewControlsZoom")){
            this.zoomControl = L.control.zoom(opt.getOption("global", "viewControlsZoomPosition"))
            this.map.addControl(this.zoomControl);
         }

        // Scale Control
        if (opt.getOption("global", "viewControlsScale")){
            this.scaleControl = L.control.scale({
                position: opt.getOption("global", "viewControlsScalePosition"),
                imperial: opt.getOption("global", "viewControlsScaleMiles"),
            })
            this.map.addControl(this.scaleControl);
         }

        // Cporyright
        if (opt.getOption("global", "viewControlsInfoCopyright")){
            this.copyrightControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoCopyrightPosition"),
                prefix: opt.getOption("global", "viewControlsInfoCopyrightText"),
            })
            this.map.addControl(this.copyrightControl);
         }   

        // Map Title
        if (opt.getOption("global", "viewControlsInfoName")){
            var title;
            try {
                title = this.mapTilesLayer.mapData.title;
            }
            catch (e) {
                title = "No title"
            }
            this.nameControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoNamePosition"),
                prefix: title,
            })
            this.map.addControl(this.nameControl);
         }  

        // Zoom Level
        if (opt.getOption("global", "viewControlsInfoZoom")){
            this.zoomLevelControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoZoomPosition"),
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

var LeafletTiles = function(mapName, mapData){

    var parent = this;

    this.mapName = mapName ? mapName : undefined;
    this.mapData = mapData ? mapData : undefined;

    this.layer;

    this.tileLayerExtendKeys = {
        case1234: function(data){return [1,2,3,4][Math.floor(Math.random() * 4)]},
        Gagarin: function(data){return "Gagarin".substr(0, Math.round("Gagarin".length * Math.random()));},
        case0123: function(data){return [0,1,2,3][Math.floor(Math.random() * 4)]},
        Galileo: function(data){return "Galileo".substr(0, Math.round("Galileo".length * Math.random()));},
     }

    if (typeof opt === "undefined" || !(opt instanceof Options)) { 
        window.opt = new Options();
        opt = window.opt;
     }

    if (typeof mapvents === "undefined" || !(mapvents instanceof Events)) { 
        window.mapvents = new Events();
        mapvents = window.mapvents;
     }

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
            // TODO: server wms type
        }
        else {
            this.layer = L.tileLayer(this.mapData.tilesURL, $.extend({
                maxZoom: this.mapData.maxZoom,
                minZoom: this.mapData.minZoom,
            }, parent.tileLayerExtendKeys));
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