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
        this.map = mapsInstance[0].map;
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
        opt.setOption("gps", "gpsData", gpsVals);
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
 
     }

 }}());


var FastMoving = (function(){

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

    var _this = this;

    window.opt = new Options();

    this.moveToPoint = function(pointId, pointData){
        console.log(pointId, pointData)
        mapsInstance[0].moveAllMaps(pointData.latlng);
     }

    this.moveToPointMenu = function(){
        var arr = opt._createMenuArrFromBase("points");
        console.log(arr)
        $.each(arr, function(g, group){
            $.each(group, function(i, v){
                arr[g][i] = opt.getOption("points", i);
                arr[g][i].callback = function(){_this.moveToPoint(i, arr[g][i])};
            })
        })
        var menu = new AccordionMenu(arr);
     }

    this.updatePoint = function(data) {
        
        if (opt.getOption("points", data.id)){
            if (!confirm(loc("editPoints:confirmRewritePoint", data.id))) { return }
        }

        var pointVals = opt.getOption("points", data.id) || {};

        $.each(data, function(i, v){
            pointVals[i] = v;
        })

        pointVals.latlng = pointVals.latlng.split(",");

        opt.setOption("points", pointVals.id, pointVals)
        console.log(pointVals.id, opt.getOption("points"));  
     }

    this.deletePoint = function(data) {
        if (opt.getOption("points", data.id)){
            if (confirm(loc("editPoints:confirmDeletePoint", data.id))) {
                opt.deleteOption("points", data.id);
                console.log(data.id + "deleted")
            }
        }   
     }

    this.editPoint = function(pointId, pointData){

        pointId = typeof pointId === "string" ? pointId : "";
        var vals = pointData ? pointData : opt.getOption("points", pointId) ? opt.getOption("points", pointId) : {};

        // Groups suggestions
        var points = opt.getOption("points");
        var groups = $.unique($.pluck(points, "group"));
        groups.sort();

        var arr = [
            { "type": "formEditPoint_id",        "name": "id", "val": vals.id || pointId || 10000*Math.random()|0, "loc": "editPoints:formEditPoint_id", "description": "id"},
            { "type": "formEditPoint_title",     "name": "title", "val": vals.title, "loc": "editPoints:formEditPoint_title", "description": "title" },
            { "type": "formEditPoint_latlng",    "name": "latlng", "val": vals.latlng || opt.getOption("current", "mapCenterLatLng"), "loc": "editPoints:formEditPoint_latlng", "description": "latlng" },
            { "type": "formEditPoint_group",     "name": "group", "val": vals.group, "options": groups, "loc": "editPoints:formEditPoint_group", "description": "group" },
            { "type": "formEditPoint_submit", "loc": "editPoints:formEditPoint_submit", callback: function(form){
                if (!form.checkFormFlag){
                    alert(loc("editPoints:errorCheckForm"));
                    return;
                } else {
                    fastmoving.updatePoint(form.data);
                    form.hideForm();
                }
            }},
            { "type": "formEditPoint_delete", "loc": "editPoints:formEditPoint_delete", callback: function(form){
                fastmoving.deletePoint(form.data);
                form.hideForm();
            }},
            { "type": "formEditPoint_cancel", "loc": "editPoints:formEditPoint_cancel", callback: function(form){
                form.hideForm();
            }},
        ];

        console.log(arr)

        var eform = new FoundationForm(arr, "formEditPoint");        
     }

    this.editPointMenu = function(){
        var arr = opt._createMenuArrFromBase("points");
        console.log(arr)
        $.each(arr, function(g, group){
            $.each(group, function(i, v){
                arr[g][i] = opt.getOption("points", i);
                arr[g][i].callback = function(){_this.editPoint(i, arr[g][i])};
            })
        })
        var menu = new AccordionMenu(arr);
     }

 }}());