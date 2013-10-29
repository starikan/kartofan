"use strict"

var Options = function(){

    var parent = this;

    // TODO: create function to set this
    this.html = {
        containerMainMenu: "#mainmenu",
        containerAllMaps: "#container",
     }

    this.global = {
        "mapDefaultCenterLatLng": "54.31727, 48.3946",
        "mapDefaultZoom": 12,
        "mapSyncMoving": true,
        "mapSyncZooming": false,
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
        "dbSync": true,
        "dbExtServerMain": "http://localhost:5984/",
        "dbExtServer": ["http://localhost:5984/"],
     };

    this.current = {
        "mapCenterLatLng": [],
        "mapZoom": undefined,
        "stage": {
            "stageName": "current",
            "stageMapsGrid": [
                [0, 0, 50, 50],
                [0, 50, 50, 50],
                [50, 0, 50, 50],
                [50, 50, 50, 50],
                [70, 70, 30, 30],
            ],
            "stageMapsNames": ["cloudmate", "cloudmate", "cloudmate", "cloudmate", "cloudmate"],
            "stageMapsZooms": [12, 8, 10, 9, 2],              
        }
     }

    this.stages = {}

    this.places = {}

    this.maps = {
        "cloudmate": {
            tags: ["0. Современные онлайн карты"],
            src: "Internet",
            server: "img",
            title: 'Cloudmate',
            tilesURL: 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
            maxZoom: 15,
            minZoom: 0,
            startZoom: 5,        
        },
     };

    this.db = {
        html: new Pouch("html", {}, function(){
            parent.initBase("html");
            parent.initReplicate("html");
        }),
        global: new Pouch("global", {}, function(){
            parent.initBase("global");
            parent.initReplicate("global");

        }),
        stages: new Pouch("stages", {}, function(){
            parent.initBase("stages");
            parent.initReplicate("stages");

        }),
        places: new Pouch("places", {}, function(){
            parent.initBase("places");
            parent.initReplicate("places");

        }),
        maps: new Pouch("maps", {}, function(){
            parent.initBase("maps");
            parent.initReplicate("maps");

        }),
        current: new Pouch("current", {}, function(){
            parent.initBase("current");
            parent.initReplicate("current");
        }),
     }

    this.initReplicate = function(name){
        if (parent.global.dbSync){
            for (var i in parent.global.dbExtServer){
                this.db[name].replicate.to(parent.global.dbExtServer[i] + name, {continuous: true});
            }
        }
     }

    this.initBase = function(name){
        $.each(parent[name], function(i, v){
            parent.db[name].get(i, function(err, doc){
                if (doc){
                    parent[name][i] = doc.val;
                }
                else {
                    parent.setOption(name, v, parent[name][v]);
                }
            })
        })
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
            // console.log(err, doc)
            if (doc) {
                doc.val = value;
                parent.db[collection].put(doc, function(err, response){});
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

    this.openEditForm = function(){

     }

    this.initOptions();

 }