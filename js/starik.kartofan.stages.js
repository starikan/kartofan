"use strict"

var StageMaps = function(container, opt){
    var parent = this;

    if (typeof opt === "undefined" || !(opt instanceof Options)) { 
        window.opt = new Options();
        opt = window.opt;
     }

    if (!container) { return }

    opt.html.containerAllMaps = "#"+container;

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
            window["layer"+i] = new LeafletTiles(names[i]);
            // window["layer"+i].setLayerOptions(names[i]);
            // window["layer"+i].setLayer();

            window["map"+i] = new LeafletMap("map"+i, opt);
            var latlng = opt.getOption("current","mapCenterLatLng");
            var zoom = zooms[i] || window["layer"+i].startZoom;
            window["map"+i].createMap(latlng, zoom);
            window["map"+i].setMapTilesLayer(window["layer"+i]);
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