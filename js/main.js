"use strict"

var LeafletMap = function(mapId){
    
    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    this.mapData;
    this.mapTylesLayer;

    this.appendMapOptions = function(data){

     }

    this.createMap = function(){
        this.map = L.map(this.mapId);
     }

    this.setMapCenter = function(latlng){
        latlng = latlng ? latlng : [51.505, -0.09];
        this.map.panTo(latlng);
     }

    this.setMapZoom = function(zoom){
        zoom = zoom ? zoom : 13;
        this.map.setZoom(zoom);
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

var LeafletTiles = function(){

    parent = this;

    this.layer;

    this.server;
    this.tilesURL;
    this.maxZoom;
    this.minZoom;

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
        return minZoom ? minZoom : 1; // If return 0 exept 1 all crashed
     }

    this._validateMaxZoom = function(maxZoom){
        return maxZoom ? maxZoom : 18;
     }

    this.setLayerOptions = function(data){

        this.server = this._validateServer(data.server);
        this.tilesURL = this._validateTilesURL(data.tilesURL);
        this.maxZoom = this._validateMaxZoom(data.maxZoom);
        this.minZoom = this._validateMinZoom(data.minZoom);

     }

    this.setLayer = function(url, minZoom, maxZoom){

        // WMS server always set using the setLayerOptions
        this.server = this.server ? this.server : this._validateServer();
        this.tilesURL = url ? this._validateTilesURL(url): this.tilesURL;
        this.maxZoom = maxZoom ? his._validateMinZoom(maxZoom): this.maxZoom;
        this.minZoom = minZoom ? this._validateMaxZoom(minZoom): this.minZoom;

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

var layer = new LeafletTiles();
layer.setLayerOptions(opt.maps.cloudmate);
layer.setLayer();

var map = new LeafletMap("map1");
map.createMap();
map.setMapCenter();
map.setMapZoom();
map.setMapTilesLayer(layer);

console.log(opt)
console.log(layer)
console.log(map)
