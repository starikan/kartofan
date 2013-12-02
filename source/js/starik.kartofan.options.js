"use strict"

var Options = (function(){

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

    window.bases = new Bases();

    var parent = this;

    // ********* ALL SETTINGS ************

    this.html = {
        "containerMainMenuId": "mainMenu",
        "containerAllMapsId": "container",
     };

    this.global = {
        "mapDefaultCenterLatLng": [54.31081536133442, 48.362503051757805],
        "mapDefaultZoom": 12,
        "mapSyncMoving": true,
        "mapSyncZooming": false,
        "mapDefaultURL": "http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.png",
        "mapVizirVisible": true,
        "mapCursorAllMapsVisible": true,

        "gpsAutoStart": true,
        "gpsMarker": true,
        "gpsAccuracy": true,
        "gpsFollowing": true,

        "externalFeeds": [
            {
                "title": "External JSON",
                "url": "https://api.github.com/repos/starikan/kartofan-public-feed/contents/mainFeed.json",
                "type": "GitHub"
            },
        ],

        "tourFirstShown": false,

        "hashChange": true,
        "resetToDefaultIfHashClear": true,

        "dbPointsStorySave": 1000,
        "dbSyncIn": true,
        "dbSyncOut": true,
        "dbExtServerIn": "http://localhost:5984/", // Ended with /
        "dbExtServerOut": ["http://localhost:5984/"], // Ended with /

        "stageViewConstructorElasticSizeErrorPersent": 2,

        "lang": "en_US",
     };

    this.current = {
        "mapCenterLatLng": [],
        "mapZoom": undefined,
        "activeMap": undefined,
        "stage": {
            "title": "current",
            "id": "current",
            "group": "",
            "tags": "",
            "stageMapsGrid": [
                // left, top, width, height
                [0, 0, 50, 50],
                [0, 50, 50, 50],
                [50, 0, 50, 50],
                [50, 50, 50, 50],
            ],
            "stageMapsNames": ["", "", "", ""],
            "stageMapsZooms": [12,12,12,12],
            "stageMapsControlls": [
                {
                    "zoom": {"pos": "topleft"},
                    "scale": {"pos": "bottomleft", "miles": false},
                    "infoCopyright": {"pos": "bottomright", "text": "Copyleft by Starik"},
                    "mapTitle": {"pos": "bottomright"},
                    "zoomLevel": {"pos": "bottomright"},
                },
                {
                    "zoom": {"pos": "topleft"},
                    "scale": {"pos": "bottomleft", "miles": false},
                    "infoCopyright": {"pos": "bottomright", "text": "Copyleft by Starik"},
                    "mapTitle": {"pos": "bottomright"},
                    "zoomLevel": {"pos": "bottomright"},
                },
                {
                    "zoom": {"pos": "topleft"},
                    "scale": {"pos": "bottomleft", "miles": false},
                    "infoCopyright": {"pos": "bottomright", "text": "Copyleft by Starik"},
                    "mapTitle": {"pos": "bottomright"},
                    "zoomLevel": {"pos": "bottomright"},
                },
                {
                    "zoom": {"pos": "topleft"},
                    "scale": {"pos": "bottomleft", "miles": false},
                    "infoCopyright": {"pos": "bottomright", "text": "Copyleft by Starik"},
                    "mapTitle": {"pos": "bottomright"},
                    "zoomLevel": {"pos": "bottomright"},
                },                
            ]
        },
        "gps": {
            "latlng": [],
            "accuracy": "",
            "altitude": "",
            "altitudeAccuracy": "",
            "heading": "",
            "speed": "",
            "timestamp": "",
        }
     };

    this.stages = {};

    this.places = {};

    this.maps = {};

    this._init = function(){
        $.each(bases.baseNames, function(i, v){
            bases.db[v] = bases._initBase(v);
        })

        this.initLocalization();
     }
    
    this._initStage = function(container){
        if (bases.basesLoaded == bases.baseNames.length){ 
            this.getHash();
            container = container ? container : this.getOption("html", "containerAllMapsId");
            window.stage = new StageMaps();
            window.stage.initContainer(container);
        }
     }  

    this.setOption = function(collection, option, value, callback){

        // JS object
        this[collection][option] = value;

        // PouchDB
        if (!bases.db[collection]) {return}
        bases.db[collection].get(option, function(err, doc){
            if (doc) {
                if (doc.val !== value){
                    doc.val = value;
                    bases.db[collection].put(doc, callback);                    
                }
            }
            else {
                bases.db[collection].put({
                    "_id": option,
                    "val": value,
                }, callback); 
            }
        })
     }

    this.getOption = function(collection, option){
        if (!option) {return this[collection]}
        return this[collection][option];
     }

    this.deleteOption = function(collection, option){
        delete this[collection][option];

        bases.db[collection].get(option, function(err, doc) {
            bases.db[collection].remove(doc, function(errRemove, responseRemove) {  });
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

    // *************** LOCALIZATION ****************

    this.localization = {};

    this.initLocalization = function(){
        var lang = this.getOption("global", "lang");
        $.getJSON("data/localization_"+lang+".json", function(data){
            if(data){
                parent.setOption("localization", lang, data);
            }
        })
     }

    this._init();

 }}());


var Bases = (function(){

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

    var parent = this;

    window.opt = new Options();

    this.baseNames = ["html", "global", "current", "stages", "places", "maps"];
    this.basesLoaded = 0;
    this.db = {};

    this._initBase = function(collection){
        return new Pouch(collection, {}, function(){
            parent.db[collection].allDocs({include_docs: true}, function(err, doc){

                if (err) {console.log(err)}

                $.each(doc.rows, function(i, v){
                    opt[collection][v.id] = v.doc.val;
                });

                // When first start, set all values from default into DB
                $.each(opt[collection], function(i, v){
                    parent.db[collection].get(i, {}, function(errG, docG){
                        if (errG){
                            opt.setOption(collection, i, v);
                        }
                    })
                })

                parent.basesLoaded++;

                parent._initSync();
                opt._initStage();
            })
        })
     };

    this._initSync = function(){
        if (this.basesLoaded == this.baseNames.length){ 
            
            if (opt.getOption("global","dbSyncOut")){
                parent.syncOut();
            }

            if (opt.getOption("global","dbSyncIn")){
                parent.syncIn();
            }
        }
     }

    this.syncOut = function(){
        $.each(opt.getOption("global","dbExtServerOut"), function(iOut, vOut){
            $.each(parent.baseNames, function(i, v){
                parent.db[v].replicate.to(vOut + v, { continuous: true }, function(err, data){
                    console.log(err, data)
                    if (err){
                        noty({text: loc("syncBases:errorExtSync", v), type: "error"});
                    }
                });
            })
        })
     }

    this.syncIn = function(){
        var baseMain = opt.getOption("global","dbExtServerIn");
        $.each(parent.baseNames, function(i, v){
            parent.db[v].replicate.from(baseMain + v, {}, function(err, data){
                if (err){ 
                    noty({text: loc("syncBases:errorExtSync", v), type: "error"});
                }
                if (data && data.docs_written){ 
                    noty({text: loc("syncBases:syncFromExtComplire", v)});
                }
            });
        })
     }

    this._clearAllBases = function(){
        $.each(parent.baseNames, function(i, v){
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

    // *************** JSON ****************

    this.exportAllInJSON = function(){
        var data = {};
        $.each(this.baseNames, function(i, v){
            data[v] = opt[v];
        })

        var dataJSON = JSON.stringify(data, null, 4);
    
        var blob = new Blob( 
            [dataJSON], 
            { type: "text/plain;charset=utf-8" }
        );
        saveAs(blob, "allData.json");
     }

    this.getAllMapsJSON = function(url){
        if (!url){
            url = prompt(loc("editMaps:mapsJSONAdd"));
        }

        $.getJSON(url, function(data){
            $.each(data.maps, function(i,v){
                if (opt.getOption("maps", i)){
                    if (!confirm(loc("editMaps:mapRewriteConfirm"))) {
                        return;
                    }
                }
                opt.setOption("maps", i, v);
            })
        }); 

     }


 }}());
