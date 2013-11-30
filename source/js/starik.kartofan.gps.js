"use strict"

var GPS = function(){

    this.map;

    this.startGPS = function(){
        // Select firs map, it`s always exist
        this.map = map0.map;
        this.map.locate();
     }

    this.onGPS = function(e){
        // console.log(e);
        var gpsVals = {
            "latlng": [e.latlng.lat, e.latlng.lng],
            "accuracy": e.accuracy,
            "altitude": e.altitude,
            "altitudeAccuracy": e.altitudeAccuracy,
            "heading": e.heading,
            "speed": e.speed,
            "timestamp": e.timestamp,
        }
        opt.setOption("current", "gps", gpsVals);
     }  

    this.errorGPS = function(e){
        console.log(e);
        noty({text: loc("gps:error"), type:"alert"});
     }  

    this.stopGPS = function(){
        if (this.map){
            this.map.stopLocate();
        }
     }
 }