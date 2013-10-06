"use strict"

var LeafletMap = function(mapId, opt){

    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    if (!opt) { 
        console.log("There is no options in LeafletMap, check this.");
        return;
     }

    var parent = this;

    this.mapTilesLayer; // copy of LeafletTiles class
    this.marksLayer; 

    this.map;

    this.zoomControl;
    this.scaleControl;
    this.copyrightControl;
    this.nameControl;
    this.zoomLevelControl;


    this.onMapMoveEnd = function(e){
        var latlng = parent.map.getCenter();
        opt.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);   
        opt.setHash();
     }

    this.onZoomEnd = function(e){
        if (!this.map) { return }

        this.setMapZoom(parent.map.getZoom());
     }

    this.updateMapControls = function(){
        if (!this.map) { return }

        if (this.zoomLevelControl){
            this.zoomLevelControl.setPrefix(this.map.getZoom());
        }

        var title;
        try { title = this.mapTilesLayer.title; }
        catch (e) { title = "No title" }

        if (this.nameControl){
            this.nameControl.setPrefix(title);
        }
     }

    this._setMapControls = function(){

        if (!this.map) { return }

        // Zoom Control
        if (opt.getOption("global", "viewControlsZoom")){
            this.zoomControl = L.control.zoom(opt.getOption("global", "viewControlsZoomPosition"))
            this.map.addControl(this.zoomControl);
         }

        // Scale Control
        if (opt.getOption("global", "viewControlsScale")){
            this.scaleControl = L.control.scale({
                position: opt.getOption("global", "viewControlsScalePosition"),
                imperial: opt.getOption("global", "viewControlsScaleMiles"),
            })
            this.map.addControl(this.scaleControl);
         }

        // Cporyright
        if (opt.getOption("global", "viewControlsInfoCopyright")){
            this.copyrightControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoCopyrightPosition"),
                prefix: opt.getOption("global", "viewControlsInfoCopyrightText"),
            })
            this.map.addControl(this.copyrightControl);
         }   

        // Map Title
        if (opt.getOption("global", "viewControlsInfoName")){
            var title;
            try {
                title = this.mapTilesLayer.title;
            }
            catch (e) {
                title = "No title"
            }
            this.nameControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoNamePosition"),
                prefix: title,
            })
            this.map.addControl(this.nameControl);
         }  

        // Zoom Level
        if (opt.getOption("global", "viewControlsInfoZoom")){
            this.zoomLevelControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoZoomPosition"),
                prefix: this.map.getZoom(),
            })
            this.map.addControl(this.zoomLevelControl);
         }                   

     }

    this._validateLatLng = function(latlng){

        latlng = latlng ? latlng : opt.getOption("global", "mapDefaultCenterLatLng");

        try {
            latlng = L.latLng(latlng);
        }
        catch(e) {
            latlng = L.latLng(opt.getOption("global", "mapDefaultCenterLatLng"));
        }

        return latlng;
     }

    this._validateZoom = function(zoom){

        if (!this.mapTilesLayer){ return opt.getOption("global", "mapDefaultZoom") }

        zoom = zoom ? zoom : opt.getOption("global", "mapDefaultZoom");

        var minZoom = this.mapTilesLayer.minZoom;
        var maxZoom = this.mapTilesLayer.maxZoom;

        zoom = zoom>=minZoom && zoom<=maxZoom ? zoom : opt.getOption("global", "mapDefaultZoom");

        return zoom;

     }

    this.createMap = function(){
        this.map = L.map(this.mapId, {
            zoomControl: false,
            attributionControl: false,
            center: opt.getOption("current", "mapCenterLatLng") || opt.getOption("global", "mapDefaultCenterLatLng"),
            zoom: opt.getOption("current", "mapZoom") || opt.getOption("global", "mapDefaultZoom"),
        });

        this.map.on("zoomend", function(e){ parent.onZoomEnd(); });
        // this.map.on("zoomend", this.onZoomEnd); // Srange but this not work ??????
        this.map.on("moveend", this.onMapMoveEnd);

        this._setMapControls();
     }

    this.setMapCenter = function(latlng){
        latlng = this._validateLatLng(latlng);
        this.map.panTo(latlng);
     }

    this.setMapZoom = function(zoom){
        zoom = this._validateZoom(zoom);
        this.map.setZoom(zoom);
        this.updateMapControls();
     }
    
    this.setMapTilesLayer = function(layerObj){

        if (this.mapTilesLayer && this.map.hasLayer(this.mapTilesLayer)){
            this.map.removeLayer(this.mapTilesLayer)
        }

        this.mapTilesLayer = layerObj;
        this.map.addLayer(this.mapTilesLayer.layer);

        this.updateMapControls();

     }

    this.refreshMapAfterResize = function(){
        this.map.invalidateSize();
     }

 }

var LeafletTiles = function(opt){

    var parent = this;

    this.layer;

    this.server;
    this.tilesURL;
    this.maxZoom;
    this.minZoom;
    this.startZoom;
    this.title;

    if (!opt) { 
        console.log("There is no options in LeafletTiles, check this.");
        return;
     }

    // TODO: сделать проверку что это строка и ссылка
    this._validateTilesURL = function(url){
        if (url) {
            return url;
        }
        else {
            return "http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.png";
        }
     }

    this._validateServer = function(server){
        return server && server in ["img", "wms"] ? server : "img";
     }

    this._validateMinZoom = function(minZoom){
        minZoom = parseInt(minZoom, 10);
        minZoom = minZoom<=18 && minZoom>0 ? minZoom : minZoom>18 ? 18 : 1; // If return 0 exept 1 all crashed
        return minZoom;
     }

    this._validateMaxZoom = function(maxZoom){
        maxZoom = parseInt(maxZoom, 10);
        maxZoom = maxZoom<=18 && maxZoom>0 ? maxZoom : 18;
        return maxZoom;
     }

    this._validateStartZoom = function(startZoom){
        startZoom = parseInt(startZoom, 10);
        startZoom = startZoom<=18 && startZoom>0 ? startZoom : opt.getOption("global", "mapDefaultZoom");
        return startZoom;
     }     

    this._validateZoomBounds = function(){
        if (!this.maxZoom || !this.minZoom) { return }

        if (this.maxZoom < this.minZoom) {
            this.maxZoom = this.minZoom;
        }
     }

    this.setLayerOptions = function(mapName){

        var data = opt.getOption("maps", mapName);

        if (!data) { return }

        this.server = this._validateServer(data.server);
        this.tilesURL = this._validateTilesURL(data.tilesURL);
        this.maxZoom = this._validateMaxZoom(data.maxZoom);
        this.minZoom = this._validateMinZoom(data.minZoom);
        this.startZoom = this._validateStartZoom(data.startZoom);
        this.title = data.title ? data.title : "Unknown Map";

        this._validateZoomBounds();
     }

    this.setLayer = function(url, minZoom, maxZoom, startZoom){

        // WMS server always set using the setLayerOptions
        this.server = this.server ? this.server : this._validateServer();
        this.tilesURL = url ? this._validateTilesURL(url): this.tilesURL;
        this.maxZoom = maxZoom ? his._validateMinZoom(maxZoom): this.maxZoom;
        this.minZoom = minZoom ? this._validateMaxZoom(minZoom): this.minZoom;
        this.startZoom = startZoom ? this._validateStartZoom(startZoom): this.startZoom;
        this.title = this.title ? this.title : "Unknown Map";

        this._validateZoomBounds();

        if (this.server && this.server === "wms"){
            // TODO: server wms type
        }
        else {
            this.layer = L.tileLayer(this.tilesURL, {
                maxZoom: this.maxZoom,
                minZoom: this.minZoom,
            });
        }
     }

 }

var Options = function(){

    var parent = this;

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

    this.initOptions();

 }

var StageMaps = function(container, opt){
    var parent = this;

    if (!opt) { 
        console.log("There is no options in StageMaps, check this.");
        return;
     }

    if (!container) { return }
    this.$container = $("#"+container);

    this.stageCurr;

    this.initStage = function(){
        this._clearHTML();
        this.$container.append(this.createStageHTML());

     }

    this._clearHTML = function(){
        this.$container.empty();
     }

    this.createStageHTML = function(){
        var stageCurr = opt.getOption("current", "stage");
        var divs = "";
        if (!stageCurr.stageMapsGrid || !stageCurr.stageMapsGrid.length){ return $divs }

        for (var i=0, grid=stageCurr.stageMapsGrid; i<grid.length; i++){
            divs += "<div id='map{0}' class='maps' style='left:{1}%; top:{2}%; width:{3}%; height:{4}%;'></div>".format(i, grid[i][0], grid[i][1], grid[i][2], grid[i][3]);
        }
        console.log(divs)   

        return divs;
     }

    this.setStageOptions = function(){

     }

 }

String.prototype.format = function() {
    var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
        ;
    });
};

var opt = new Options();
opt.getHash();

var stage = new StageMaps("container", opt);
stage.initStage();

var layer0 = new LeafletTiles(opt);
layer0.setLayerOptions("cloudmate");
layer0.setLayer();

var layer1 = new LeafletTiles(opt);
layer1.setLayerOptions("cloudmate");
layer1.setLayer();

var map0 = new LeafletMap("map0", opt);
map0.createMap();
map0.setMapTilesLayer(layer0);
map0.setMapCenter(opt.getOption("current","mapCenterLatLng"));
map0.setMapZoom(layer0.startZoom);

var map1 = new LeafletMap("map1", opt);
map1.createMap();
map1.setMapTilesLayer(layer1);
map1.setMapCenter(opt.getOption("current","mapCenterLatLng"));
map1.setMapZoom(layer1.startZoom);

console.log(opt)
console.log(layer0)
console.log(layer1)
console.log(map0)
console.log(map1)
