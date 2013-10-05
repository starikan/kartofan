"use strict"

var LeafletMap = function(mapId){
    
    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    this.map = L.map(mapId).setView([51.505, -0.09], 13);

}

var map = new LeafletMap("map1");