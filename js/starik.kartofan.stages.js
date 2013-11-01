"use strict"

var StageMaps = function(container){
    var parent = this;

    if (typeof opt === "undefined" || !(opt instanceof Options)) { 
        window.opt = new Options();
        opt = window.opt;
     }

    if (typeof mapvents === "undefined" || !(mapvents instanceof Events)) { 
        window.mapvents = new Events();
        mapvents = window.mapvents;
     }

    if (!container) { return }

    opt.setOption("html", "containerAllMapsId", container);

    this.$container = $("#"+container);

    this.stageCurr;

    this._initStage = function(){
        this._clearHTML();
        this._getCurrentStage();
        this.$container.append(this._createStageHTML());
        this._createMaps();
     }

    this._getCurrentStage = function(){
        this.stageCurr = opt.getOption("current", "stage");
     }

    this._clearHTML = function(){
        this.$container.empty();
     }

    this._createMaps = function(){
        if (!this.stageCurr.stageMapsGrid || !this.stageCurr.stageMapsGrid.length){ return }

        var names = this.stageCurr.stageMapsNames;
        var zooms = this.stageCurr.stageMapsZooms;
        var grid = this.stageCurr.stageMapsGrid;
        for (var i=0; i<grid.length; i++){

            window["map"+i] = new LeafletMap("map"+i);
            var latlng = opt.getOption("current","mapCenterLatLng");
            var zoom = zooms[i] || opt.getOption("maps",names[i]).startZoom;
            window["map"+i].createMap(latlng, zoom);
            window["map"+i].setMapTilesLayer(new LeafletTiles(names[i]));

        }
     }

    this._createStageHTML = function(){
        var divs = "";
        if (!this.stageCurr.stageMapsGrid || !this.stageCurr.stageMapsGrid.length){ return divs }

        var grid = this.stageCurr.stageMapsGrid;
        for (var i=0; i<grid.length; i++){
            divs += "<div id='map{0}' class='maps' \
                    style='left:{1}%; top:{2}%; width:{3}%; \
                    height:{4}%;'></div>".format(i, grid[i][0], grid[i][1], grid[i][2], grid[i][3]);
        }
        return divs;
     }

    this.setStageOptions = function(){

     }

    this._initStage();

 }