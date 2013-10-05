"use strict"

var LeafletMap = function(mapId){
    
    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    this.mapData;

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
    
    this.setMapTiles = function(){

     }

    this.refreshMapAfterResize = function(){
        this.map.invalidateSize();
     }

 }

var map = new LeafletMap("map1");
map.createMap();
map.setMapCenter();
map.setMapZoom();
