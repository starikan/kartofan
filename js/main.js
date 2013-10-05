"use strict"

var LeafletMap = function(mapId, opt){
    
    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    if (!opt) { 
        console.log("There is no options in LeafletMap, check this.");
        return;
     }

    this.mapData = { // dict with main states of map
        "center": {
            "lat": undefined,
            "lng": undefined
        },
        "zoom": undefined,
     }; 

    this.mapTilesLayer; // copy of LeafletTiles class
    this.marksLayer; 

    this.map;

    this.setMapControls = function(){

        if (!this.map) { return }

        if (opt.global.viewControlsZoom){
            this.map.addControl(L.control.zoom(opt.global.viewControlsZoomPosition));
         }

        if (opt.global.viewControlsScale){
            var scaleControll = L.control.scale({
                position: opt.global.viewControlsScalePosition,
                imperial: opt.global.viewControlsScaleMiles,
            })
            this.map.addControl(scaleControll);
         }

        if (opt.global.viewControlsInfoCopyright){
            var infoControll = L.control.attribution({
                position: opt.global.viewControlsInfoCopyrightPosition,
                prefix: opt.global.viewControlsInfoCopyrightText,
            })
            this.map.addControl(infoControll);
         }   

        if (opt.global.viewControlsInfoName){
            var infoControll = L.control.attribution({
                position: opt.global.viewControlsInfoNamePosition,
                prefix: this.mapTilesLayer.title,
            })
            this.map.addControl(infoControll);
         }  

        if (opt.global.viewControlsInfoZoom){
            var infoControll = L.control.attribution({
                position: opt.global.viewControlsInfoZoomPosition,
                prefix: this.mapData.zoom,
            })
            this.map.addControl(infoControll);
         }                   

     }

    this._validateLatLng = function(latlng){

        latlng = latlng ? latlng : opt.global.mapDefaultCenterLatLng;

        try {
            latlng = L.latLng(latlng);
        }
        catch(e) {
            latlng = L.latLng(opt.global.mapDefaultCenterLatLng);
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
     }

    this.setMapCenter = function(latlng){
        latlng = this._validateLatLng(latlng);
        this.map.panTo(latlng);

        this.mapData.center = {
            "lat": latlng.lat,
            "lng": latlng.lng,
        }
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

        var data = opt.maps[mapName];

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

    // TODO: нужна проверка наличия всех нужных глобальных переменных, если нет то принудительно обновлять
    // TODO: сделать проверку соответствия viewControlsZoomPosition и подобных определенным значениям

    this.global = {

        "mapDefaultCenterLatLng": [54.31727, 48.3946],
        "mapDefaultZoom": 12,

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

 }

var Hash = function(opt){

    // Hash format: #latlng

    this.latlng;

    if (!opt) { 
        console.log("There is no options in Hash, check this.");
        return;
     }    

    this.setHash = function(){
        
        if (!opt.global.hashChange) { return }

     }

    this.getHash = function(){
        
        if (!opt.global.hashChange) { return }

        var hash = window.location.hash;

        try {
            var latlng = L.latLng(hash.split("#").pop().split(","))
            this.latlng = [latlng.lat, latlng.lng];
        }
        catch (e) {
            console.log(e)
        }

     }     
}

var opt = new Options();

var hash = new Hash(opt);
hash.getHash();

var layer = new LeafletTiles(opt);
layer.setLayerOptions("cloudmate");
layer.setLayer();

var map = new LeafletMap("map1", opt);
map.createMap();
map.setMapCenter(hash.latlng);
map.setMapZoom();
map.setMapTilesLayer(layer);
map.setMapControls();

console.log(opt)
console.log(hash)
console.log(layer)
console.log(map)
