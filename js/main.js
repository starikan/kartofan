"use strict"

var LeafletMap = function(mapId){
    
    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    this.mapData;
    this.mapTylesLayer;

    this.appendMapData = function(data){

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

    this.setLayer = function(url){
        url = url ? url : 'http://tile.openstreetmap.org/{z}/{x}/{y}.png';
        this.layer = L.tileLayer(url);
    }

}

var map = new LeafletMap("map1");
map.createMap();
map.setMapCenter();
map.setMapZoom();

var layer = new LeafletTiles();
layer.setLayer();
map.setMapTilesLayer(layer);

layer.setLayer("http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png");
map.setMapTilesLayer(layer);