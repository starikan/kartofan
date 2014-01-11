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

        vals = $.extend({}, vals, data);

        var arr = [
            { "type": "formEditMarker_id",     "name": "id",     "val": vals.id, "loc": "markers:formEditMarker_id", "description": "id"},
            { "type": "formEditMarker_title",  "name": "title",  "val": vals.title, "loc": "markers:formEditMarker_title", "description": "title" },
            { "type": "formEditMarker_layer",  "name": "layer",  "val": vals.layer, "loc": "markers:formEditMarker_layer", "description": "layer" },
            { "type": "formEditMarker_icon",   "name": "icon",   "val": vals.icon, "loc": "markers:formEditMarker_icon", "description": "icon" },
            { "type": "formEditMarker_tags",   "name": "tags",   "val": vals.tags, "loc": "markers:formEditMarker_tags", "description": "tags" },
            { "type": "formEditMarker_latlng", "name": "latlng", "val": vals.latlng, "loc": "markers:formEditMarker_latlng", "description": "latlng" },
            { "type": "formEditMarker_submit", "loc": "markers:formEditMarker_submit", callback: function(form){
                if (!form.checkFormFlag){
                    alert(loc("markers:errorCheckForm"));
                    return;
                } else {

                    // Update marker on every window after adding
                    _this.updateAllMapsView(form.data);
                    console.log(form.data)
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

        this._createIconPanelInForm(eform);
        this._createTagsPanelInForm(eform);

     };

    this._createTagsPanelInForm = function(eform) {
        var tags = eform.data.tags ? eform.data.tags.split(",") : [];
        var $tags = eform.$form.find("#formEditMarker_tagsPanel");
        var $tagsSrc = eform.$form.find("#formEditMarker_tagsSrc");
        tags = unique(tags.map(fulltrim)).sort();
        
        var updatePanel = function() {
            $tags.empty();

            for (var i = 0; i < tags.length; i++) {
                // TODO: touch
                var $addTag = $("<a>{0}</a>".format(tags[i])).addClass("button tiny formInputTag");
                $addTag.click(function(){
                    removeTag($(this).text());
                });
                $tags.append($addTag);
            };               
        }
         
        var addNewTag = function(data){
            if (!data) return;
            data.indexOf(",") == -1 ? tags.push(data) : tags = tags.concat(data.split(","));

            tags = unique(tags.map(fulltrim)).sort();
            $tagsSrc.val(tags.join(", "));

            updatePanel();
            addContols();
        }

        var removeTag = function(data) {
            if (!data) return;
            if (tags.indexOf(data) != -1) {
                tags.splice(tags.indexOf(data), 1)
            }
            else return
            
            $tagsSrc.val(tags.join(", "));

            updatePanel();
            addContols();
        }

        var addContols = function() {
            var $inputRow = $('<div class="row collapse">\
                <div class="small-10 columns">\
                  <input type="text" id="formEditMarker_tagsAddInput">\
                </div>\
                <div class="small-2 columns ">\
                  <a class="button tiny postfix" id="formEditMarker_tagsAddButton">+</a>\
                </div>\
            </div>')
            $tags.append($inputRow); 

            // TODO: touch
            $("#formEditMarker_tagsAddInput").on("keypress", function(e){
                if (e.charCode === 13){ addNewTag($(this).val()); }
            })
            $("#formEditMarker_tagsAddButton").click(function(){addNewTag($("#formEditMarker_tagsAddInput").val())})   
        }

        updatePanel();
        addContols();

     }

    this._createIconPanelInForm = function(eform) {
        var icons = opt.getOption("global", "markersIcons");
        var $icons = eform.$form.find("#formEditMarker_iconsPanel");
        var $iconSrc = eform.$form.find("#formEditMarker_iconSrc");

        $icons.empty();

        for (var i = icons.length - 1; i >= 0; i--) {
            var $icon = $("<image src={0}></image>".format(icons[i]));
            if (eform.data.icon == icons[i]) $icon.addClass("selected");
            // TODO: touch
            $icon.click(function(e){
                $icons.find(".selected").removeClass("selected");
                $(e.target).addClass("selected");
                $iconSrc.val(this.src.replace(window.location.origin, ""));
            })
            $icons.append($icon);
        };
     }

    this.deleteMarkerData = function(data, callback) {

     };     

    this.removeMarkers = function(filter, callback) {

     };

    this.cacheIconsObjects = function(iconSrc, callback) {
        var iconsL = opt.getOption("appVars", "markerIconsObjects");

        var img = new Image();
        img.src = iconSrc;
        img.onload = function() {
            iconsL[iconSrc] = new L.Icon({
                iconUrl: iconSrc,
                iconRetinaUrl: iconSrc,
                iconSize: [this.width, this.height],
                iconAnchor: [this.width/2, this.height],
                // popupAnchor: [-3, -76],
            })
            callback(iconsL[iconSrc]);
        }

        opt.setOption("appVars", "markerIconsObjects", iconsL);
     }   

    this.getMarker = function(data) {
        var marker = new L.Marker();
        var icons = opt.getOption("appVars", "markerIconsObjects");

        marker.setLatLng(data.latlng.split(","));
        if (data.icon) {

            // Cached Icon object
            if (!icons[data.icon]) {
                _this.cacheIconsObjects(data.icon, function(icon){marker.setIcon(icon)})
            }
            else {
                marker.setIcon(icons[data.icon])
            }
        };

        marker.id = data.id;

        // TODO: touch
        marker.on("dblclick", this.onMarkerDblclick);
        marker.on("contextmenu", this.onMarkerContextmenu);
        marker.on("dragend", this.onMarkerDragend);
        marker.on("mouseout", this.onMarkerMouseout);

        return marker;
     };

    this.onMarkerDblclick = function(e){
        var data = opt.getOption("markers", this.id)
        _this.editMarkerForm(data);
     }

    this.onMarkerContextmenu = function(e){
        e.originalEvent.preventDefault();
        this.dragging.enable();
     }     

    this.onMarkerDragend = function(e){
        var data = opt.getOption("markers", this.id);
        data.latlng = e.target._latlng.toNormalString();
        _this.updateAllMapsView(data);
     }

    this.onMarkerMouseout = function(e){
        // There is some bug if moveing mouse very fast it`s lost the hover and dragging is disable
        setTimeout(function() {
            if (this.draggable) {
                this.dragging.disable();
            }
        }, 1000)        
     }  

    this.updateAllMapsView = function(data) {
        this.updateMarkerData(data, function(){
            for (var i = mapsInstance.length - 1; i >= 0; i--) {
                mapsInstance[i].markers.init();
                mapsInstance[i].markers.showMarkers();
            };
        });
     };

    this.showMarkers = function(callback, options) {

        // Create MarkerClusterGroup
        for (var i = this.filteredDataLayers.length - 1; i >= 0; i--) {
            if (this.mapObject.markersLayers[this.filteredDataLayers[i]]) {
                // Clear all previous layers
                this.mapObject.markersLayers[this.filteredDataLayers[i]].clearLayers();
            }
            else {
                this.mapObject.markersLayers[this.filteredDataLayers[i]] = new L.MarkerClusterGroup(options);
            }
            this.map.addLayer(this.mapObject.markersLayers[this.filteredDataLayers[i]])
        };

        // Create Markers itself
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