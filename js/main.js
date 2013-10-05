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

    this.mapTylesLayer; // copy of LeafletTiles class
    this.marksLayer; 

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

        if (!this.mapTylesLayer){ return opt.global.mapDefaultZoom }

        zoom = zoom ? zoom : opt.global.mapDefaultZoom;

        var minZoom = this.mapTylesLayer.minZoom;
        var maxZoom = this.mapTylesLayer.maxZoom;

        zoom = zoom>=minZoom && zoom<=maxZoom ? zoom : opt.global.mapDefaultZoom;

        return zoom;
        
     }

    this.createMap = function(){
        this.map = L.map(this.mapId);
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

        if (this.mapTylesLayer && this.map.hasLayer(this.mapTylesLayer)){
            this.map.removeLayer(this.mapTylesLayer)
        }

        this.mapTylesLayer = layerObj.layer;
        this.map.addLayer(this.mapTylesLayer);
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

        this._validateZoomBounds();
     }

    this.setLayer = function(url, minZoom, maxZoom){

        // WMS server always set using the setLayerOptions
        this.server = this.server ? this.server : this._validateServer();
        this.tilesURL = url ? this._validateTilesURL(url): this.tilesURL;
        this.maxZoom = maxZoom ? his._validateMinZoom(maxZoom): this.maxZoom;
        this.minZoom = minZoom ? this._validateMaxZoom(minZoom): this.minZoom;

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

    this.global = {
        "mapDefaultCenterLatLng": [54.31727, 48.3946],
        "mapDefaultZoom": 12,
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

var opt = new Options();

var layer = new LeafletTiles(opt);
layer.setLayerOptions("cloudmate");
layer.setLayer();

var map = new LeafletMap("map1", opt);
map.createMap();
map.setMapCenter();
map.setMapZoom();
map.setMapTilesLayer(layer);

console.log(opt)
console.log(layer)
console.log(map)
