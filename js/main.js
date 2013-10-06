"use strict"

var LeafletMap = function(mapId, opt){

    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    if (!opt) { 
        console.log("There is no options in LeafletMap, check this.");
        return;
     }

    parent = this;

    this.mapData = { // dict with main states of map
        "center": [undefined, undefined],
        "zoom": undefined,
     }; 

    this.mapTilesLayer; // copy of LeafletTiles class
    this.marksLayer; 

    this.map;

    this.onMapDragging = function(){
        var latlng = parent.map.getCenter();

        parent.mapData.center = [latlng.lat, latlng.lng]; 

        opt.setOption("current", "mapCenterLatLng", parent.mapData.center);   

        opt.setHash();
     }

    this.setMapControls = function(){

        if (!this.map) { return }

        if (opt.getOption("global", "viewControlsZoom")){
            this.map.addControl(L.control.zoom(opt.getOption("global", "viewControlsZoomPosition")));
         }

        if (opt.getOption("global", "viewControlsScale")){
            var scaleControll = L.control.scale({
                position: opt.getOption("global", "viewControlsScalePosition"),
                imperial: opt.getOption("global", "viewControlsScaleMiles"),
            })
            this.map.addControl(scaleControll);
         }

        if (opt.getOption("global", "viewControlsInfoCopyright")){
            var infoControll = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoCopyrightPosition"),
                prefix: opt.getOption("global", "viewControlsInfoCopyrightText"),
            })
            this.map.addControl(infoControll);
         }   

        if (opt.getOption("global", "viewControlsInfoName")){
            var infoControll = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoNamePosition"),
                prefix: this.mapTilesLayer.title,
            })
            this.map.addControl(infoControll);
         }  

        if (opt.getOption("global", "viewControlsInfoZoom")){
            var infoControll = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoZoomPosition"),
                prefix: this.mapData.zoom,
            })
            this.map.addControl(infoControll);
         }                   

     }

    this._validateLatLng = function(latlng){

        latlng = latlng ? latlng : opt.getOption("global", "mapDefaultCenterLatLng");

        try {
            latlng = L.latLng(latlng);
        }
        catch(e) {
            latlng = L.latLng(opt.getOption("global", "mapDefaultCenterLatLng"));
        }

        return latlng;
     }

    this._validateZoom = function(zoom){

        if (!this.mapTilesLayer){ return opt.global.mapDefaultZoom }

        zoom = zoom ? zoom : opt.global.mapDefaultZoom;

        var minZoom = this.mapTilesLayer.minZoom;
        var maxZoom = this.mapTilesLayer.maxZoom;

        zoom = zoom>=minZoom && zoom<=maxZoom ? zoom : opt.global.mapDefaultZoom;

        return zoom;

     }

    this.createMap = function(){
        this.map = L.map(this.mapId, {
            zoomControl: false,
            attributionControl: false,
        });

        this.map.on("moveend", this.onMapDragging);
     }

    this.setMapCenter = function(latlng){
        latlng = this._validateLatLng(latlng);
        this.map.panTo(latlng);

        this.mapData.center = [latlng.lat, latlng.lng];
     }

    this.setMapZoom = function(zoom){
        zoom = this._validateZoom(zoom);
        this.map.setZoom(zoom);

        this.mapData.zoom = zoom;
     }
    
    this.setMapTilesLayer = function(layerObj){

        if (this.mapTilesLayer && this.map.hasLayer(this.mapTilesLayer)){
            this.map.removeLayer(this.mapTilesLayer)
        }

        this.mapTilesLayer = layerObj;
        this.map.addLayer(this.mapTilesLayer.layer);

        this.mapData.title = this.mapTilesLayer.title;

     }

    this.refreshMapAfterResize = function(){
        this.map.invalidateSize();
     }

 }

var LeafletTiles = function(opt){

    parent = this;

    this.layer;

    this.server;
    this.tilesURL;
    this.maxZoom;
    this.minZoom;
    this.title;

    if (!opt) { 
        console.log("There is no options in LeafletTiles, check this.");
        return;
     }

    // TODO: сделать проверку что это строка и ссылка
    this._validateTilesURL = function(url){
        if (url) {
            return url;
        }
        else {
            return "http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.png";
        }
     }

    this._validateServer = function(server){
        return server && server in ["img", "wms"] ? server : "img";
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

    this._validateZoomBounds = function(){
        if (!this.maxZoom || !this.minZoom) { return }

        if (this.maxZoom < this.minZoom) {
            this.maxZoom = this.minZoom;
        }
     }

    this.setLayerOptions = function(mapName){

        var data = opt.getOption("maps", mapName);

        if (!data) { return }

        this.server = this._validateServer(data.server);
        this.tilesURL = this._validateTilesURL(data.tilesURL);
        this.maxZoom = this._validateMaxZoom(data.maxZoom);
        this.minZoom = this._validateMinZoom(data.minZoom);
        this.title = data.title ? data.title : "Unknown Map";

        this._validateZoomBounds();
     }

    this.setLayer = function(url, minZoom, maxZoom){

        // WMS server always set using the setLayerOptions
        this.server = this.server ? this.server : this._validateServer();
        this.tilesURL = url ? this._validateTilesURL(url): this.tilesURL;
        this.maxZoom = maxZoom ? his._validateMinZoom(maxZoom): this.maxZoom;
        this.minZoom = minZoom ? this._validateMaxZoom(minZoom): this.minZoom;
        this.title = this.title ? this.title : "Unknown Map";

        this._validateZoomBounds();

        if (this.server && this.server === "wms"){
            // TODO: server wms type
        }
        else {
            this.layer = L.tileLayer(this.tilesURL, {
                maxZoom: this.maxZoom,
                minZoom: this.minZoom,
            });
        }
     }

 }

var Options = function(){

    parent = this;

    // TODO: нужна проверка наличия всех нужных глобальных переменных, если нет то принудительно обновлять
    // TODO: сделать проверку соответствия viewControlsZoomPosition и подобных определенным значениям

    this.global = {

        "mapDefaultCenterLatLng": [54.31727, 48.3946],
        "mapDefaultZoom": 12,
        "mapSyncMoving": true,
        "mapSyncZooming": false,

        "viewControlsZoom": true,
        "viewControlsZoomPosition": "topleft",
        "viewControlsScale": true,
        "viewControlsScalePosition": "bottomleft",
        "viewControlsScaleMiles": false,
        "viewControlsInfoName": true,
        "viewControlsInfoNamePosition": "bottomright",        
        "viewControlsInfoZoom": true,
        "viewControlsInfoZoomPosition": "bottomright",
        "viewControlsInfoCopyright": true,
        "viewControlsInfoCopyrightPosition": "bottomright",
        "viewControlsInfoCopyrightText": "Copyleft by Starik",

        "hashChange": true,

     };

    this.current = {
        "mapCenterLatLng": [],

        "stageMapsGrid": {},
        "stageMapsNames": ["cloudmate", "cloudmate"],
        "stageMapsZooms": [12, 8],
     }

    this.maps = {
        "cloudmate": {
            tags: ["0. Современные онлайн карты"],
            src: "Internet",
            server: "img",
            title: 'Cloudmate',
            tilesURL: 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
            maxZoom: 18,
            minZoom: 0,
            startZoom: 13,        
        },
     };

    this.setOption = function(collection, option, value){
        this[collection][option] = value;
        // TODO: Update in localstorage and files in dropbox
     }

    this.getOption = function(collection, option){
        return this[collection][option];
     }

    this.setHash = function(){
        
        if (!this.getOption("global", "hashChange") || !this.getOption("global", "mapSyncMoving")) { 
            window.location.hash = "";
            return 
        }

        window.location.hash = this.getOption("current", "mapCenterLatLng").join(",");

     }

    this.getHash = function(){
        
        if (!this.getOption("global", "hashChange")) { return }

        var hash = window.location.hash;

        try {
            var latlng = L.latLng(hash.split("#").pop().split(","))
            this.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);
        }
        catch (e) {}

     }    

 }

var StageMaps = function(opt){
    parent = this;

    if (!opt) { 
        console.log("There is no options in StageMaps, check this.");
        return;
     }

    this.getStage = function(){

     }

 }

var opt = new Options();
opt.getHash();

var stage = new StageMaps(opt);
stage.getStage();

var layer = new LeafletTiles(opt);
layer.setLayerOptions("cloudmate");
layer.setLayer();

var map = new LeafletMap("map1", opt);
map.createMap();
map.setMapCenter(opt.current.mapCenterLatLng);
map.setMapZoom();
map.setMapTilesLayer(layer);
map.setMapControls();

console.log(opt)
console.log(layer)
console.log(map)
