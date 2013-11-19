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

    this._initStage = function(){
        this._clearHTML();
        // this.$container.append(this._createStageHTML());
        this._createStageHTML();
        this._createMaps();
     }

    this._clearHTML = function(){
        this.$container.empty();
     }

    this._createMaps = function(){

        var currStage = opt.getOption("current", "stage");

        if (!currStage.stageMapsGrid || !currStage.stageMapsGrid.length){ return }

        var names = currStage.stageMapsNames;
        var zooms = currStage.stageMapsZooms;
        var grid = currStage.stageMapsGrid;
        for (var i=0; i<grid.length; i++){

            window["map"+i] = new LeafletMap("map"+i);
            var latlng = opt.getOption("current","mapCenterLatLng");
            var zoom = zooms[i] || opt.getOption("maps",names[i]).startZoom;
            window["map"+i].setMapTilesLayer(new LeafletTiles(names[i]));
            window["map"+i].createMap(latlng, zoom);
        }
     }

    this._createStageHTML = function(){
        // var divs = "";
        var currStage = opt.getOption("current", "stage");

        if (!currStage.stageMapsGrid || !currStage.stageMapsGrid.length){ return divs }

        var grid = currStage.stageMapsGrid;

        $.each(grid, function(i, v){
            $("<div></div>")
            .appendTo(parent.$container)
            .attr("id", "map"+i)
            .css("position", "absolute")
            .css("left", v[0]+"%")
            .css("top", v[1]+"%")
            .css("width", v[2]+"%")
            .css("height", v[3]+"%");
        })    
        // for (var i=0; i<grid.length; i++){
        //     divs += "<div id='map{0}' class='maps' \
        //             style='left:{1}%; top:{2}%; width:{3}%; \
        //             height:{4}%;'></div>".format(i, grid[i][0], grid[i][1], grid[i][2], grid[i][3]);
        // }
        // return divs;
     }

    this.setStage = function(){

     }

    this._initStage();

 }