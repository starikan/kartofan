"use strict"

var Options = function(container){

    var parent = this;

    // ********* ALL SETTINGS ************

    this.bases = ["html", "global", "current", "stages", "places", "maps"];
    this.basesLoaded = 0;

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
        "mapExternalFeeds": ["json/maps.json"],

        "hashChange": true,
        "resetToDefaultIаHashClear": true,

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

    this.maps = {};

    this.db = {}


    // ********* POUCHDB *************
    this._initBase = function(collection){
        return new Pouch(collection, {}, function(){
            parent.db[collection].allDocs({include_docs: true}, function(err, doc){

                $.each(doc.rows, function(i, v){
                    parent[collection][v.id] = v.doc.val;
                });

                parent.basesLoaded++;

                parent._initSync();
                parent._initStage();
            })
        })
     };

    this._initSync = function(){
        if (this.basesLoaded == this.bases.length){ 
            // if (parent.global.dbSyncIn){
            //     parent.db[collection].replicate.from(parent.global.dbExtServerMain + collection, {}, function(){
            //         parent.configureBase(collection);
            //     });                
            // }
            // else {
            //     parent.configureBase(collection);
            // }

    //     // Replicate
    //     if (parent.global.dbSyncOut){
    //         for (var i in parent.global.dbExtServer){
    //             parent.db[collection].replicate.to(parent.global.dbExtServerMain + collection, {continuous: true});
    //             // parent.db[collection].replicate.from(parent.global.dbExtServerMain + collection, {continuous: true});
    //         }
    //     }  

        }
     }

    this._initStage = function(){
        if (this.basesLoaded == this.bases.length){ 
            this.getHash();
            container = container ? container : this.getOption("html", "containerAllMapsId");
            window.stage = new StageMaps(container);
        }
     }

    this._init = function(){
        $.each(this.bases, function(i, v){
            parent.db[v] = parent._initBase(v);
        })
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

    // *************** HASH ****************

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

    this._init();

 }