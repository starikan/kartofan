"use strict"

var Options = function(){

    var parent = this;

    // TODO: create function to set this
    this.html = {
        containerMainMenu: "#mainmenu",
        containerAllMaps: "#container",
     }

    this.global = {

        "mapDefaultCenterLatLng": [54.31727, 48.3946],
        "mapDefaultZoom": 12,
        "mapSyncMoving": true,
        "mapSyncZooming": false,

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

        "hashChange": true,
     };

    this.current = {
        "mapCenterLatLng": [],
        "mapZoom": undefined,

        "stage": {
            "stageName": "current",
            "stageMapsGrid": [
                [0, 0, 100, 50],
                [0, 50, 100, 50],
            ],
            "stageMapsNames": ["cloudmate", "cloudmate"],
            "stageMapsZooms": [12, 8],            
        },

     }

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

    // TODO: написать
    this.initOptions = function(){
        this.getHash();
     }

    // TODO: нужна проверка наличия всех нужных глобальных переменных, если нет то принудительно обновлять
    // TODO: сделать проверку соответствия viewControlsZoomPosition и подобных определенным значениям
    this.checkOptions = function(){

     }     

    this.setOption = function(collection, option, value){
        this[collection][option] = value;
        // TODO: Update in localstorage and files in dropbox
     }

    this.getOption = function(collection, option){
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

    this.createJsonToForm = function(obj, header, submit){
        header = header ? header : "Header";
        submit = submit && typeof submit === "object" ? submit : [];
     }

    this.initOptions();

 }