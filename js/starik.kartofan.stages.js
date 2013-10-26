"use strict"

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
            window["layer"+i] = new LeafletTiles(opt);
            window["layer"+i].setLayerOptions(names[i]);
            window["layer"+i].setLayer();

            window["map"+i] = new LeafletMap("map"+i, opt);
            window["map"+i].createMap();
            window["map"+i].setMapTilesLayer(window["layer"+i]);
            window["map"+i].setMapCenter(opt.getOption("current","mapCenterLatLng"));
            window["map"+i].setMapZoom(zooms[i] || window["layer"+i].startZoom);
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

 }