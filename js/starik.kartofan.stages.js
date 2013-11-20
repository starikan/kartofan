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

    this.currStage;

    this.createStage = function(){
        this.$container.empty();
        this.currStage = opt.getOption("current", "stage");
        if (!this.currStage.stageMapsGrid || !this.currStage.stageMapsGrid.length){ return }

        $.each(this.currStage.stageMapsGrid, function(i, v){
            parent.addMapDiv(i, v);
            parent.addMapObject(i);
        })

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

    this.createStage();

 }