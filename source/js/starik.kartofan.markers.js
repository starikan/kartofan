var Markers = function(map) {

    window.opt = new Options();

    var _this = this;
    
    this.mapObject;
    this.map;

    this.allData = {};
    this.allDataLayers = [];

    this.filteredData = {};
    this.filteredDataLayers = [];

    this.init = function(map) {
        if (!opt.getOption("current", "markersShow")) return;

        this.setMap(map);
        this.getMarkersData();
        this.filterMarkersData();
     };

    this.getMarkersData = function() {
        this.allData = $.extend({}, opt.getOption("markers"));

        for (var i in  this.allData) {
            if (this.allDataLayers.indexOf(this.allData[i].layer) == -1){
                this.allDataLayers.push(this.allData[i].layer);
            }
        };

        // console.log(this.allData)
        // console.log(this.allDataLayers)        
     };

    this.filterMarkersData = function(filter) {
        filter = filter ? filter : opt.getOption("current", "markersFilter");

        if (!filter || (typeof filter === "object" && $.isEmptyObject(filter))){
            this.filteredData = this.allData;
        }
        else {

            for ( var d in this.allData ) {
                for ( var f in filter ){
                    if (!_this.allData[d][f].match(new RegExp(filter[f]))) {
                        continue;
                    }                        
                    _this.filteredData[d] = _this.allData[d];
                }                
            }
        }

        for (var i in this.filteredData) {
            if (this.filteredDataLayers.indexOf(this.filteredData[i].layer) == -1){
                this.filteredDataLayers.push(this.filteredData[i].layer);
            }
        };

        // console.log(this.filteredData)
        // console.log(this.filteredDataLayers)
     };

    this.setMap = function(map) {
        map ? this.mapObject = map : this.mapObject;
        this.map = this.mapObject ? this.mapObject.map : this.map;
     }

    this.updateMarkerData = function(data, callback) {
        opt.setOption("markers", data.id, data, callback);
     };

    this.editMarkerForm = function(data) {
        var latlng = opt.getOption("appVars", "cursorLatLng");

        var now = new Date()

        var vals = {
            id: opt.getOption("global", "markersIdPrefix") + moment().format("YYYY-MM-DD-HH-mm-ss"),
            title: moment().format("YYYY-MM-DD-HH-mm-ss"),
            latlng: latlng.toNormalString(),
        };

        vals = $.extend({}, data, vals);

        var arr = [
            { "type": "formEditMarker_id",     "name": "id",     "val": vals.id, "loc": "markers:formEditMarker_id", "description": "id"},
            { "type": "formEditMarker_title",  "name": "title",  "val": vals.title, "loc": "markers:formEditMarker_title", "description": "title" },
            { "type": "formEditMarker_group",  "name": "group",  "val": vals.group, "loc": "markers:formEditMarker_group", "description": "group" },
            { "type": "formEditMarker_layer",  "name": "layer",  "val": vals.layer, "loc": "markers:formEditMarker_layer", "description": "layer" },
            { "type": "formEditMarker_latlng", "name": "latlng", "val": vals.latlng, "loc": "markers:formEditMarker_latlng", "description": "latlng" },
            { "type": "formEditMarker_submit", "loc": "markers:formEditMarker_submit", callback: function(form){
                if (!form.checkFormFlag){
                    alert(loc("markers:errorCheckForm"));
                    return;
                } else {
                    _this.updateMarkerData(form.data, function(){_this.showMarkers();});
                    form.hideForm();
                }
            }},
            { "type": "formEditMarker_delete", "loc": "markers:formEditMarker_delete", callback: function(form){
                // _this.deleteMarkerData(form.data, function(){eform.hideForm()});
            }},
            { "type": "formEditMarker_cancel", "loc": "markers:formEditMarker_cancel", callback: function(form){
                form.hideForm();
            }},
        ];

        var eform = new FoundationForm(arr, "formEditMarker");

     };

    this.deleteMarkerData = function(data, callback) {

     };     

    this.removeMarkers = function(filter, callback) {

     };

    this.getMarker = function(data) {
        var marker = new L.Marker();

        marker.setLatLng(data.latlng.split(","));
        return marker;
     };

    this.showMarkers = function(callback, options) {
        for (var i = this.filteredDataLayers.length - 1; i >= 0; i--) {
            this.mapObject.markersLayers[this.filteredDataLayers[i]] = new L.MarkerClusterGroup(options);
            this.map.addLayer(this.mapObject.markersLayers[this.filteredDataLayers[i]])
        };

        for (var i in this.filteredData) {
            var layer = this.filteredData[i].layer || "";
            var marker = this.getMarker(this.filteredData[i]);
            this.mapObject.markersLayers[layer].addLayer(marker);
        };
     };

    this.setFilter = function(filter) {

     };

    this.init(map);

 }