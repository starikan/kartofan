var Markers = function(map) {

    window.opt = new Options();

    var _this = this;
    
    map ? this.map = map : this.map;
    this.allData;
    this.filteredData;

    this.init = function() {
        if (!opt.getOption("global", "markersShow")) return;

        this.updateMarkersData();
     };

    this.setMap = function(map) {
        this.map = map;
     }

    this.updateMarkersData = function() {

     };

    this.addMarker = function() {
        console.log(opt.getOption("appVars", "cursorLatLng"));
     };

    this.showOnMap = function(filter) {

     };

    this.setFilter = function() {

     };

    this.init();

 }