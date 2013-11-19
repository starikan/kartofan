"use strict"

var Options = function(container){

    var parent = this;

    // ********* ALL SETTINGS ************

    this.bases = ["html", "global", "current", "stages", "places", "maps"];
    this.basesLoaded = 0;
    // this.basesSyncedIn = 0;

    // TODO: create function to set this
    this.html = {
        "containerMainMenuId": "mainMenu",
        "containerAllMapsId": "container",
     }

    this.global = {
        "mapDefaultCenterLatLng": [54.31081536133442, 48.362503051757805],
        "mapDefaultZoom": 12,
        "mapSyncMoving": true,
        "mapSyncZooming": false,
        "mapExternalFeeds": ["json/maps.json"],

        "hashChange": true,
        "resetToDefaultIfHashClear": true,

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
        "dbExtServerIn": "http://localhost:5984/", // Ended with /
        "dbExtServerOut": ["http://localhost:5984/"], // Ended with /

        "stageViewConstructorElasticSizeErrorPersent": 2,
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

                if (err) {console.log(err)}

                $.each(doc.rows, function(i, v){
                    parent[collection][v.id] = v.doc.val;
                });

                // When first start, set all values from default into DB
                $.each(parent[collection], function(i, v){
                    parent.db[collection].get(i, {}, function(errG, docG){
                        if (errG){
                            parent.setOption(collection, i, v);
                        }
                    })
                })

                parent.basesLoaded++;

                parent._initSync();
                parent._initStage();
            })
        })
     };

    this._initSync = function(){
        if (this.basesLoaded == this.bases.length){ 
            
            if (parent.getOption("global","dbSyncOut")){
                $.each(parent.getOption("global","dbExtServerOut"), function(iOut, vOut){
                    $.each(parent.bases, function(i, v){
                        parent.db[v].replicate.to(vOut + v, {
                            continuous: true, 
                            // TODO: усли ошибка то выводить предупреждение
                            // onChange: function(data){ console.log(data) },
                        });
                    })
                })
            }

            if (parent.getOption("global","dbSyncIn")){
                parent.syncIn();
            }
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

    this.syncIn = function(){
        var baseMain = parent.getOption("global","dbExtServerIn");
        $.each(parent.bases, function(i, v){
            parent.db[v].replicate.from(baseMain + v, {}, function(err, data){
                // TODO: усли ошибка то выводить предупреждение
                // TODO: если пришло обновление то тоже выводить предупреждение.
                // console.log(v, err, data)
            }); 
        })
     }

    this._clearAllBases = function(){
        $.each(parent.bases, function(i, v){
            parent.db[v].allDocs({include_docs: true}, function(errBase, docBase){
                console.log(errBase, docBase)
                $.each(docBase.rows, function(iRow, vRow){
                    console.log(iRow, vRow)
                    parent.db[v].get(vRow.doc._id, function(errRow, docRow) {
                        console.log(errRow, docRow)
                        parent.db[v].remove(docRow, function(errRemove, responseRemove) {  });
                    });                    
                });
            });
        })
     }

    // TODO: нужна проверка наличия всех нужных глобальных переменных, если нет то принудительно обновлять
    // TODO: сделать проверку соответствия viewControlsZoomPosition и подобных определенным значениям
    this.checkOptions = function(collection){

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

    this.getOption = function(collection, option){
        if (!option) {return this[collection]}
        return this[collection][option];
     }

    this.deleteOption = function(collection, option){
        delete this[collection][option];

        parent.db[collection].get(option, function(err, doc) {
            parent.db[collection].remove(doc, function(errRemove, responseRemove) {  });
        });  
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

        // If clear hash and resetToDefaultIfHashClear == true set to default latlng
        if (!hash && parent.getOption("global", "resetToDefaultIfHashClear")){
            this.setOption("current", "mapCenterLatLng", parent.getOption("global", "mapDefaultCenterLatLng"));
            this.setHash();
            return;
        }

        try {
            var latlng = L.latLng(hash.split("#").pop().split(","))
            this.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);
        }
        catch (e) {
            window.location.hash = "badCoords";
            this.setOption("current", "mapCenterLatLng", parent.getOption("global", "mapDefaultCenterLatLng"));
        }

     }    

    this._init();

 }