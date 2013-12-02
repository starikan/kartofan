"use strict"

var StageMaps = (function(){

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
    window.mapvents = new Events();
    window.gps = new GPS();

    this.$container;
    this.currStage;

    this.initContainer = function(container){
        if (!container) { return }
        opt.setOption("html", "containerAllMapsId", container);
        this.$container = $("#"+container);
        this.createStage();
     }

    this.createStage = function(){
        this.$container.empty();
        this.currStage = opt.getOption("current", "stage");
        if (!this.currStage.stageMapsGrid || !this.currStage.stageMapsGrid.length){ return }

        $.each(this.currStage.stageMapsGrid, function(i, v){
            parent.addMapDiv(i, v);
            parent.addMapObject(i);
        })

        // First visit automaticaly start tour
        if (!opt.getOption("global", "tourFirstShown")){
            tourMain.start(true);
            opt.setOption("global", "tourFirstShown", true);
        }

        if (opt.getOption("global", "gpsAutoStart")){
            gps.startGPS();
        }

     }

    this.addMapDiv = function(i, v){
        $("<div></div>")
        .appendTo(parent.$container)
        .attr("id", "map"+i)
        .addClass("maps")
        .css("position", "absolute")
        .css("left", v[0]+"%")
        .css("top", v[1]+"%")
        .css("width", v[2]+"%")
        .css("height", v[3]+"%");
     }

    this.addMapObject = function(i){
        var names = this.currStage.stageMapsNames;
        var zooms = this.currStage.stageMapsZooms;

        window["map"+i] = new LeafletMap("map"+i);
        var latlng = opt.getOption("current","mapCenterLatLng");
        var zoom = zooms[i] || opt.getOption("maps",names[i]).startZoom;
        window["map"+i].setMapTilesLayer(new LeafletTiles(names[i]));
        window["map"+i].createMap(latlng, zoom);        
    }
 }}());

var StageEditor = (function(){

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

 }}());