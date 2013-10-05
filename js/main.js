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

    this.setLayerOptions = function(data){
        this.server = data.server && data.server in ["img", "wms"] ? data.server : "img";
        this.tilesURL = this._validateTilesURL(data.tilesURL);
        this.maxZoom = data.maxZoom ? data.maxZoom : 18;
        this.minZoom = data.minZoom ? data.minZoom : 1;
     }

    this.setLayer = function(url){
        url = url ? url : this.tilesURL? this.tilesURL : this._validateTilesURL();
        this.layer = L.tileLayer(url);
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

