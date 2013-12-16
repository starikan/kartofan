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

    var parent = this;

    // ********* ALL SETTINGS ************

    this.global = {
        "mapDefaultCenterLatLng": [54.31081536133442, 48.362503051757805],
        "mapDefaultZoom": 12,
        "mapDefaultURL": "http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.png",
        "mapCachedService": "http://127.0.0.1:3000",

        "mainFeed": "https://api.github.com/repos/starikan/kartofan-public-feed/contents/mainFeed.json?callback",

        "isTourFirstShown": true,
        "isSetLangFirstShown": true,

        "hashChange": true,
        "resetToDefaultIfHashClear": true,

        "dbExtServerIn": "http://localhost:5984/", // Ended with /
        "dbExtServerOut": ["http://localhost:5984/"], // Ended with /

        "stageViewConstructorElasticSizeErrorPersent": 2,

        "lang": "en_US",
        "langs": ["en_US", "ru_RU"],
     };

    this.current = {
        "mapCenterLatLng": [],
        "mapZoom": undefined,
        "mapSyncMoving": true,
        "mapSyncZooming": false,
        "mapVizirVisible": true,
        "mapCursorAllMapsVisible": true,
        "mapCache": true,
        "mapCacheLoad": "internet", // internet, cache, internet+cach, cach+internet

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
                    "measure": {"pos": "topleft"},
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

        "viewTopMenuShowAlways": false,
        "viewInfoPanelShowAlways": true,   

        "dbPointsStorySave": 1000,
        "dbSyncIn": true,
        "dbSyncOut": true,

     };

    this.gps = {
        "gpsData": {
            "latlng": [],
            "accuracy": "",
            "altitude": "",
            "altitudeAccuracy": "",
            "heading": "",
            "speed": "",
            "timestamp": "",
         },
        "gpsAutoStart": true,
        "gpsMarker": true,
        "gpsAccuracy": true,
        "gpsFollowing": true,
     }

    this.stages = {};

    this.points = {};

    this.maps = {};

    this.appVars = {
        "mapsControlsList": [ "zoom", "scale", "infoCopyright", "mapTitle", "zoomLevel", "measure" ],
        "baseNames": ["global", "gps", "stages", "points", "maps", "current"],
        "baseNamesSync": ["global", "gps", "stages", "points", "maps"],
        "activeMap": "map0",
        "activeMapNum": 0,        
     }

    this._init = function(){
        window.bases = new Bases();
        bases._initBase();
     }

    this._afterInitProcessing = function () {

        window.stage = new StageMaps();
        window.topmenu = new TopMenu("topMenuKartofan", "containerKartofan");
        window.gps = new GPS();
        window.mapseditor = new MapsEditor();
        window.stageeditor = new StageEditor();
        window.locations = new Locations();
        window.infomenu = new InfoMenu();
        window.fastmoving = new FastMoving();

        // TODO: удалить
        window.mapvents = new Events();

        opt.getHash();

        stage.initContainer("containerKartofan");

        // First visit automaticaly start tour
        if (opt.getOption("global", "isTourFirstShown")){
            //tourMain.start(true);
            opt.setOption("global", "isTourFirstShown", false);
        }

        if (opt.getOption("gps", "gpsAutoStart")){
            gps.startGPS();
        }

        if (opt.getOption("global", "isSetLangFirstShown")){
            opt.setLang();
            opt.setOption("global", "isSetLangFirstShown", false);
        }   
     } 

    this._afterInit = function(){

        if (!bases.checkBasesLoaded()){ return }


        // If no localization create it and then repeat again
        if ($.isEmptyObject(parent.localization)){
            parent.initLocalization(parent._afterInit);
            return;
        }

        parent._afterInitProcessing();
     }

    this.setOption = function(collection, option, value, callback){

        // JS object
        this[collection][option] = value;

        // PouchDB
        if (!bases.db[collection]) {
            callback ? callback() : "";
            return
        }

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

        if (!bases.db[collection]) {return}
        bases.db[collection].get(option, function(err, doc) {
            bases.db[collection].remove(doc, function(errRemove, responseRemove) {  });
        });  
     }

    this.editGlobalForm = function(){
        
        // eform = new EditableForm(mapvents.globalOptionsForm);
        // eform.fillForm(parent.global);

     }

    this._createMenuArrFromBase = function(base, data) {

        var arr = {};
        data = data ? data : this.getOption(base);

        $.each(data, function(i, v){
            v.group = v.group ? v.group : "Unknown";
            if (!arr[v.group]){
                arr[v.group] = {};
            }
            arr[v.group][v.id ? v.id : i] = {};
        })

        console.log(arr)

        return arr;
     }  

    // *************** HASH ****************

    this.setHash = function(){
        
        if (!this.getOption("global", "hashChange") || !this.getOption("current", "mapSyncMoving")) { 
            window.location.hash = "";
            return 
        }

        var latlng = this.getOption("current", "mapCenterLatLng");
        window.location.hash = $.isArray(latlng) ? latlng.join(",") : latlng;
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

    // Callback neded because localization must loaded before all code but after all bases sync, look this._afterInit
    this.initLocalization = function(callback){
        var lang = this.getOption("global", "lang");
        $.getJSON("data/localization_en_US.json", function(data){
            if(data){ parent.setOption("localization", "en_US", data) }
            $.getJSON("data/localization_"+lang+".json", function(data){
                if(data){ parent.setOption("localization", lang, data, callback) }
            })             
        });
       
     }

    this.setLang = function() {
        var menuLangChoise = {
            "Choose Your Language": {
                "English": {
                    title: "English", 
                    callback: function(){ opt.setOption("global", "lang", "en_US")}
                },
                "Russian":{
                    title: "Russian", 
                    callback: function(){ opt.setOption("global", "lang", "ru_RU")}
                }
            }
         };

        var menu = new AccordionMenu(menuLangChoise);
     }     

    // *************** JSON ****************

    this.exportAllInJSON = function(){
        var data = {};
        $.each(opt.getOption("appVars", "baseNames"), function(i, v){
            data[v] = parent[v];
        })

        var dataJSON = JSON.stringify(data, null, 4);
    
        var blob = new Blob( 
            [dataJSON], 
            { type: "text/plain;charset=utf-8" }
        );
        saveAs(blob, "allData.json");
     }

    this.getAllDataFromJSON = function(baseJson, url){

        url = url ? url : prompt(loc("jsonImport:jsonAdd"), this.getOption("global", "mainFeed"))
        baseJson = baseJson ? [baseJson] : opt.getOption("appVars", "baseNames");

        $.getJSON(url, function(data){

            try { data = JSON.parse(Base64.decode(data.content)) }
            catch(e){}

            $.each(baseJson, function(b, base){
                if (!data[base] || $.isEmptyObject(data[base])){ return }
                $.each(data[base], function(i, v){
                    if (opt.getOption(base, i)){
                        if (!confirm(loc("jsonImport:rewriteConfirm", [i, base]))) {
                            return;
                        }
                    }
                    opt.setOption(base, i, v);
                })                
            })
        }); 
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

    this.basesLoaded = 0;

    this.db = {};
    this.mapCache = {};

    this.checkBasesLoaded = function(){

        var syncBases = opt.getOption("appVars", "baseNamesSync").length ? opt.getOption("appVars", "baseNamesSync").length : 0;

        if (this.basesLoaded >= syncBases){ 
            return true;
        }
        return false;
     }

    this.initBaseMapCache = function(mapName){
        if (!mapName){ return }
        parent.mapCache["map_"+mapName] = new Pouch("map_"+mapName, {}, function(){})
     }

    this._initBase = function(){
        $.each(opt.getOption("appVars", "baseNames"), function(c, collection){
            parent.db[collection] =  new Pouch(collection, {}, function(){
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

                    if (opt.getOption("appVars", "baseNamesSync").indexOf(collection) != -1){
                        parent.basesLoaded++;
                    }

                    parent._initSync();
                    opt._afterInit();
                })
            })
        })        

     };

    this._initSync = function(){
        if (!this.checkBasesLoaded()){return};

        if (opt.getOption("current", "dbSyncOut")){
            parent.syncOut();
        }

        if (opt.getOption("current", "dbSyncIn")){
            parent.syncIn();
        }
     }

    this.syncOut = function(){
        $.each(opt.getOption("global","dbExtServerOut"), function(iOut, vOut){
            $.each(opt.getOption("appVars", "baseNamesSync"), function(i, v){
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
        $.each(opt.getOption("appVars", "baseNamesSync"), function(i, v){
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
        $.each(opt.getOption("appVars", "baseNames"), function(i, v){
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

 }}());
