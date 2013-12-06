"use strict"

var GPS = (function(){

    var instance;

    return function Construct_singletone () {
        if (instance) {
            return instance;
        }
        if (this && this.constructor === Construct_singletone) {
            instance = this;
        } else {
            return new Construct_singletone();
        }

    window.opt = new Options();

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

 }}());

var Locations = (function(){

    var instance;

    return function Construct_singletone () {
        if (instance) {
            return instance;
        }
        if (this && this.constructor === Construct_singletone) {
            instance = this;
        } else {
            return new Construct_singletone();
        }

    window.opt = new Options();

    this.createForm = function(){
        // var arr = [
        //     { "type": "input", "id": "title", "description": loc("usage:locationFormInput") },
        //  ];
        // var eform = new EditableForm(arr);
     }

 }}());
