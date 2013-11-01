"use strict"

var Options = function(){

    var parent = this;

    // ********* ALL SETTINGS ************

    var sets = ["html", "global", "current", "stages", "places", "maps"];

    // TODO: create function to set this
    this.html = {
        "containerMainMenuId": "mainMenu",
        "containerAllMapsId": "container",
     }

    this.global = {
        "mapDefaultCenterLatLng": "54.31081536133442,48.362503051757805",
        "mapDefaultZoom": 12,
        "mapSyncMoving": true,
        "mapSyncZooming": false,
        "mapExternalFeeds": ["json/maps.json", "json/maps2.json"],

        "hashChange": true,

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

        "dbPointsStorySave": 1000,
        "dbSyncIn": true,
        "dbSyncOut": true,
        "dbExtServerMain": "http://localhost:5984/",
        "dbExtServer": ["http://localhost:5984/"],
     };

    this.current = {
        "mapCenterLatLng": [],
        "mapZoom": undefined,
        "activeMap": undefined,
        "stage": {
            "stageName": "current",
            "stageMapsGrid": [
                [0, 0, 50, 50],
                [0, 50, 50, 50],
                [50, 0, 50, 50],
                [50, 50, 50, 50],
            ],
            "stageMapsNames": ["cloudmate", "", "", "cloudmate"],
            "stageMapsZooms": [12,12,12,12],  
        }
     }

    this.stages = {}

    this.places = {}

    this.maps = {
        "cloudmate": {
            tags: ["0. Online Maps"],
            group: "0. Online Maps",
            src: "Internet",
            server: "img",
            title: 'Cloudmate',
            tilesURL: 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
            maxZoom: 15,
            minZoom: 0,
            startZoom: 5,
        },
     };

    this.setWatch = function(collection){
        watch(parent[collection], function(option, action, newvalue, oldvalue){
            // console.log(option, action, newvalue, oldvalue, _.has(parent[collection], option), collection, option);
            if (_.has(parent[collection], option)){
                // console.log("in")
                parent.setOption(collection, option, newvalue);
            }
            else {
                // console.log("out")
                $.each(parent[collection], function(option, newvalue){
                    parent.setOption(collection, option, newvalue);
                })
            }
        })
     }

    $.each(sets, function(i,v){
        parent.setWatch(v);
     })

    // ********* POUCHDB *************
    this.initBase = function(collection){
        return new Pouch(collection, {}, function(){
            if (parent.global.dbSyncIn){
                parent.db[collection].replicate.from(parent.global.dbExtServerMain + collection, {}, function(){
                    parent.configureBase(collection);
                });                
            }
            else {
                parent.configureBase(collection);
            }
        })
     };

    this.configureBase = function(collection){

        // Base init
        $.each(parent[collection], function(i, v){
            parent.db[collection].get(i, function(err, doc){
                if (doc){
                    parent[collection][i] = doc.val;
                }
                else {
                    parent.setOption(collection, i, v);
                }
            })
        })

        // Replicate
        if (parent.global.dbSyncOut){
            for (var i in parent.global.dbExtServer){
                parent.db[collection].replicate.to(parent.global.dbExtServerMain + collection, {continuous: true});
            }
        }        
     };

    this.db = {
        html: parent.initBase("html"),
        global: parent.initBase("global"),
        stages: parent.initBase("stages"),
        places: parent.initBase("places"),
        maps: parent.initBase("maps"),
        current: parent.initBase("current"),
     }

    // TODO: написать
    this.initOptions = function(){
        this.getHash();
     }

    // TODO: нужна проверка наличия всех нужных глобальных переменных, если нет то принудительно обновлять
    // TODO: сделать проверку соответствия viewControlsZoomPosition и подобных определенным значениям
    this.checkOptions = function(){

     }     

    this.setOption = function(collection, option, value){
        // JS object
        this[collection][option] = value;

        // PouchDB
        this.db[collection].get(option, function(err, doc){
            if (doc) {
                if (doc.val !== value){
                    doc.val = value;
                    parent.db[collection].put(doc, function(err, response){});                    
                }
            }
            else {
                parent.db[collection].put({
                    "_id": option,
                    "val": value,
                }, function(err, response){}); 
            }
        })
     }

    // TODO: сделать получение из базы,  а если базы нет то из локальной переменной
    this.getOption = function(collection, option){
        if (!option) {return this[collection]}
        return this[collection][option];
     }

    this.setHash = function(){
        
        if (!this.getOption("global", "hashChange") || !this.getOption("global", "mapSyncMoving")) { 
            window.location.hash = "";
            return 
        }

        window.location.hash = this.getOption("current", "mapCenterLatLng").join(",");

     }

    this.getHash = function(){
        
        if (!this.getOption("global", "hashChange")) { return }

        var hash = window.location.hash;

        try {
            var latlng = L.latLng(hash.split("#").pop().split(","))
            this.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);
        }
        catch (e) {}

     }    

    this.initOptions();

 }