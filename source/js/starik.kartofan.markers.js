var Markers = function(map) {

    window.opt = new Options();

    var _this = this;
    
    this.mapObject;
    this.map;   

    this.allData = {};
    this.allDataLayers = [];

    this.filteredData = {};
    this.filteredDataLayers = [];

    this.clickForDescriptionFlag = false;

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

    this.saveMarkerData = function(data, callback) {
        // for (var i=0; i<150; i++){
        //     opt.setOption("markers", i+"_"+Math.round(Math.random()*100000), data);
        //     console.log(i);
        // }

        if (data.descriptionHTML != undefined) {
            opt.setOption("markersDescriptions", data.id, data.descriptionHTML);
        }      

        delete data.descriptionHTML;
        opt.setOption("markers", data.id, data, callback);

     };

    this.updateAllMapsView = function(data) {
        this.saveMarkerData(data, function(){_this.refreshView()});
     };

    this.editMarkerForm = function(data) {
        var latlng = opt.getOption("appVars", "cursorLatLng");

        var now = moment().format("YYYY-MM-DD-HH-mm-ss-SSS");

        var vals = {
            id: opt.getOption("global", "markersIdPrefix") + now,
            title: now,
            latlng: latlng.toNormalString(),
        };

        vals = $.extend({}, vals, data);

        console.log(data)

        opt.getOptionAsync("markersDescriptions", vals.id, function(descriptionHTML){
            
            vals.descriptionHTML = descriptionHTML;

            var arr = [
                { "type": "formEditMarker_id",            "name": "id",     "val": vals.id, "loc": "markers:formEditMarker_id", "description": "id"},
                { "type": "formEditMarker_title",         "name": "title",  "val": vals.title, "loc": "markers:formEditMarker_title", "description": "title" },
                { "type": "formEditMarker_layer",         "name": "layer",  "val": vals.layer, "loc": "markers:formEditMarker_layer", "description": "layer" },
                { "type": "formEditMarker_icon",          "name": "icon",   "val": vals.icon, "loc": "markers:formEditMarker_icon", "description": "icon" },
                { "type": "formEditMarker_description",   "name": "description",   "val": vals.description, "loc": "markers:formEditMarker_description", "description": "description" },
                { "type": "formEditMarker_descriptionHTML",  "name": "descriptionHTML",   "val": vals.descriptionHTML, "loc": "markers:formEditMarker_descriptionHTML", "description": "descriptionHTML" },
                { "type": "formEditMarker_links",         "name": "links",   "val": vals.links, "loc": "markers:formEditMarker_links", "description": "links" },
                { "type": "formEditMarker_tags",          "name": "tags",   "val": vals.tags, "loc": "markers:formEditMarker_tags", "description": "tags" },
                { "type": "formEditMarker_latlng",        "name": "latlng", "val": vals.latlng, "loc": "markers:formEditMarker_latlng", "description": "latlng" },
                
                { "type": "formEditMarker_dateStart", "name": "dateStart", "val": vals.dateStart, "loc": "markers:formEditMarker_dateStart" },
                { "type": "formEditMarker_dateEnd", "name": "dateEnd", "val": vals.dateEnd, "loc": "markers:formEditMarker_dateEnd" },
                
                { "type": "formEditMarker_dateStartAddFinal", "loc": "markers:formEditMarker_dateStartAddFinal", callback: function(){
                    $("#addDateFinalRow").toggleClass("hide");
                } },
                { "type": "formEditMarker_dateStartAddTime", "loc": "markers:formEditMarker_dateStartAddTime", callback: function(a, b, c){
                    $("a.formEditMarker_dateStartAddTime").toggleClass("disabled");
                    _this._createDataPicker(!$("a.formEditMarker_dateStartAddTime").hasClass("disabled"));
                } },
                { "type": "formEditMarker_dateEndAddTime", "loc": "markers:formEditMarker_dateEndAddTime", callback: function(){
                    $("a.formEditMarker_dateEndAddTime").toggleClass("disabled");
                    _this._createDataPicker(!$("a.formEditMarker_dateEndAddTime").hasClass("disabled"));
                } },
                { "type": "formEditMarker_descriptionHTMLAddButton", "loc": "markers:formEditMarker_descriptionHTMLAddButton", callback: function(){
                    $("#descriptionHTMLRow").toggleClass("hide");
                } },            
              
                // Not added fields
                { "type": "formEditMarker_altitude",       "name": "altitude", "val": vals.altitude, "loc": "markers:formEditMarker_altitude", "description": "altitude" },
                { "type": "formEditMarker_speed",          "name": "speed", "val": vals.speed, "loc": "markers:formEditMarker_speed", "description": "speed" },
                { "type": "formEditMarker_velocity",       "name": "velocity", "val": vals.velocity, "loc": "markers:formEditMarker_velocity", "description": "velocity" },
                { "type": "formEditMarker_autor",          "name": "autor", "val": vals.autor, "loc": "markers:formEditMarker_autor", "description": "autor" },
                { "type": "formEditMarker_type",           "name": "type", "val": vals.type, "loc": "markers:formEditMarker_type", "description": "type" },
                { "type": "formEditMarker_circleRadius",   "name": "circleRadius", "val": vals.circleRadius, "loc": "markers:formEditMarker_circleRadius", "description": "circleRadius" },
                { "type": "formEditMarker_iconHover",      "name": "iconHover", "val": vals.iconHover, "loc": "markers:formEditMarker_iconHover", "description": "iconHover" },
                { "type": "formEditMarker_iconHoverScale", "name": "iconHoverScale", "val": vals.iconHoverScale, "loc": "markers:formEditMarker_iconHoverScale", "description": "iconHoverScale" },
                { "type": "formEditMarker_iconScale",      "name": "iconScale", "val": vals.iconScale, "loc": "markers:formEditMarker_iconScale", "description": "iconScale" },
                { "type": "formEditMarker_heading",        "name": "heading", "val": vals.heading, "loc": "markers:formEditMarker_heading", "description": "heading" },
                { "type": "formEditMarker_tilt",           "name": "tilt", "val": vals.tilt, "loc": "markers:formEditMarker_tilt", "description": "tilt" },
                { "type": "formEditMarker_addsObj",        "name": "addsObj", "val": vals.addsObj, "loc": "markers:formEditMarker_addsObj", "description": "addsObj" },


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
                     _this.deleteMarkerData(form.data, function(){eform.hideForm()});
                }},
                { "type": "formEditMarker_cancel", "loc": "markers:formEditMarker_cancel", callback: function(form){
                    form.hideForm();
                }},
            ];

            console.log(vals);

            var eform = new FoundationForm(
                arr, 
                "formEditMarker", 
                function(){
                    CKEDITOR.replace("formEditMarker_descriptionHTML", {baseFloatZIndex: 200000000000});
                },
                function(){
                    if (CKEDITOR.instances.formEditMarker_descriptionHTML) {
                        CKEDITOR.instances.formEditMarker_descriptionHTML.destroy();    
                    }
                }
            );

            vals.dateEnd ? $("#addDateFinalRow").removeClass("hide"): $("#addDateFinalRow").addClass("hide");
            vals.descriptionHTML ? $("#descriptionHTMLRow").removeClass("hide"): $("#descriptionHTMLRow").addClass("hide");

            _this._createDataPicker(false);
            _this._createIconPanelInForm(eform);
            _this._createTagsPanelInForm(eform);

        });

     };

    this._createDataPicker = function(timeFlag) {
        $("input.formEditMarker_dateStart").datetimepicker({
            datepicker: true,
            timepicker: true,
            closeOnDateSelect: !timeFlag,
            format: timeFlag ? 'Y/m/d H:i' : 'Y/m/d',
            validateOnBlur: false,
        });
        $("input.formEditMarker_dateEnd").datetimepicker({
            datepicker: true,
            timepicker: true,
            closeOnDateSelect: !timeFlag,
            format: timeFlag ? 'Y/m/d H:i' : 'Y/m/d',
            validateOnBlur: false,
        });
     };

    this._createTagsPanelInForm = function(eform) {
        var tags = eform.data.tags ? eform.data.tags.split(",") : [];
        var $tagsPanel = eform.$form.find("#formEditMarker_tagsPanel");
        var $tagsSrc = eform.$form.find("#formEditMarker_tagsSrc");
        var $tagsAddInput = eform.$form.find("#formEditMarker_tagsAddInput");
        tags = unique(tags.map(fulltrim)).sort();
        
        // TODO: touch
        $tagsAddInput.on("keypress", function(e){
            if (e.charCode === 13){ 
                addNewTag($tagsAddInput.val());
                $tagsAddInput.val(""); 
            }
        })
        $("#formEditMarker_tagsAddButton").click(function(){
            addNewTag($tagsAddInput.val());
            $tagsAddInput.val(""); 
        })   


        var updatePanel = function() {
            $tagsPanel.empty();

            for (var i = 0; i < tags.length; i++) {
                // TODO: touch
                var $addTag = $("<a>{0}</a>".format(tags[i])).addClass("button tiny formInputTag");
                $addTag.click(function(){
                    removeTag($(this).text());
                });
                $tagsPanel.append($addTag);
            };               
        }
         
        var addNewTag = function(data){
            if (!data) return;
            data.indexOf(",") == -1 ? tags.push(data) : tags = tags.concat(data.split(","));

            tags = unique(tags.map(fulltrim)).sort();
            $tagsSrc.val(tags.join(", "));

            updatePanel();
        }

        var removeTag = function(data) {
            if (!data) return;
            if (tags.indexOf(data) != -1) {
                tags.splice(tags.indexOf(data), 1)
            }
            else return
            
            $tagsSrc.val(tags.join(", "));

            updatePanel();
        }

        updatePanel();
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
        console.log(data);
        if (confirm(loc("markers:deleteMarker"))){
            opt.deleteOption("markers", data.id, function(){
                _this.refreshView();
            });
            callback ? callback() : undefined;
        }
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

        data.title ? marker.bindLabel(data.title) : undefined;

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
        marker.on("click", this.onMarkerСlick);
        marker.on("contextmenu", this.onMarkerContextmenu);
        marker.on("dragend", this.onMarkerDragend);
        marker.on("mouseout", this.onMarkerMouseout);

        return marker;
     };

    this.onMarkerСlick = function(e){
        var data = opt.getOption("markers", this.id)
        _this.clickForDescriptionFlag = true;
        setTimeout(function(){
            _this.clickForDescriptionFlag = false;
        }, 1000);
     }

    this.onMarkerDblclick = function(e){
        var data = opt.getOption("markers", this.id)
        _this.editMarkerForm(data);
     }

    this.onMarkerContextmenu = function(e){

        // Description, shows after click
        if (_this.clickForDescriptionFlag) {
            var data = opt.getOption("markers", this.id)
            var $markerDescription = $("#markerDescription");
            $markerDescription.empty();
            $markerDescription.append(data.description);
            $markerDescription.arcticmodal();
        } 
        // Else dragg marker
        else {
            e.originalEvent.preventDefault();
            this.dragging.enable();            
        }
     }     

    this.onMarkerDragend = function(e){
        var data = opt.getOption("markers", this.id);
        data.latlng = e.target._latlng.toNormalString();
        _this.updateAllMapsView(data);
     }

    this.onMarkerMouseout = function(e){
        // There is some bug if moveing mouse very fast it`s lost the hover and dragging is disable
        setTimeout(function() {
            if (e.target.dragging._enabled) {
                e.target.dragging.disable();
            }
        }, 1000)        
     }  

    this.refreshView = function(){
        for (var i = mapsInstance.length - 1; i >= 0; i--) {
            mapsInstance[i].markers.init();
            mapsInstance[i].markers.showMarkers();
        };
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

var CoordsCorrection = (function(){

    window.opt = new Options();

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

    var _this = this;

    this.rightIcon = L.divIcon({className: 'coordsCorrection_rightMarker', iconSize: [32, 32]});
    this.wrongIcon = L.divIcon({className: 'coordsCorrection_wrongMarker', iconSize: [32, 32]});;
    this.$menu = $("#topMenuCoordsCorrection");
    this.serviceLayer = opt.getOption("appVars", "markersServiceLayer");

    this.init = function(){

     }

    this.showMenu = function(){
        _this.$menu.removeClass("hide-for-small-only hide-for-medium-up hide-for-large-up hide-for-xlarge-up hide-for-xxlarge-up");
     }

    this.hideMenu = function(){
        _this.$menu.addClass("hide-for-small-only hide-for-medium-up hide-for-large-up hide-for-xlarge-up hide-for-xxlarge-up");
     }

    this.addRightMarker = function(){
        var activeMapNum = opt.getOption("appVars", "activeMapNum");
        var map = mapsInstance[activeMapNum];

        for (var i = mapsInstance.length - 1; i >= 0; i--) {
            var layer = mapsInstance[i].markersLayers[_this.serviceLayer];
            if (layer){
                for (var j in layer._layers) {
                    if (layer._layers[j].id === "__rightMarker"){
                        layer.removeLayer(j);
                    }
                };
            }
        };

        if (!map.markersLayers[_this.serviceLayer]){
            map.markersLayers[_this.serviceLayer] = new L.LayerGroup();
            map.map.addLayer(map.markersLayers[_this.serviceLayer]);
        }

        var marker = new L.Marker();
        marker.setLatLng(opt.getOption("current", "mapCenterLatLng"));
        marker.id = "__rightMarker";
        marker.setIcon(_this.rightIcon);

        map.markersLayers[_this.serviceLayer].addLayer(marker);
     }

    this.addWrongMarker = function(){
        var activeMapNum = opt.getOption("appVars", "activeMapNum");
        var map = mapsInstance[activeMapNum];

        var layer = map.markersLayers[_this.serviceLayer];
        if (layer){
            for (var j in layer._layers) {
                if (layer._layers[j].id === "__wrongMarker"){
                    layer.removeLayer(j);
                }
            };
        }

        if (!map.markersLayers[_this.serviceLayer]){
            map.markersLayers[_this.serviceLayer] = new L.LayerGroup();
            map.map.addLayer(map.markersLayers[_this.serviceLayer]);
        }

        var marker = new L.Marker();
        marker.setLatLng(opt.getOption("current", "mapCenterLatLng"));
        marker.id = "__wrongMarker";
        marker.setIcon(_this.wrongIcon);

        map.markersLayers[_this.serviceLayer].addLayer(marker);
     }

    this.removeMarkers = function(){
        for (var i = mapsInstance.length - 1; i >= 0; i--) {
            var layer = mapsInstance[i].markersLayers[_this.serviceLayer];
            if (layer){
                layer.clearLayers();
            }
        };
     }

    this.addCorrectionOnMaps = function(){

        var rightLatLng,
            rightMapNumber;

        for (var i = mapsInstance.length - 1; i >= 0; i--) {
            var layer = mapsInstance[i].markersLayers[_this.serviceLayer];
            if (layer){
                for (var j in layer._layers) {
                    if (layer._layers[j].id === "__rightMarker"){
                        rightLatLng = layer._layers[j]._latlng;
                        rightMapNumber = i;
                        break;
                    }
                };
            }
            if (rightLatLng) break;
        };

        if (!rightLatLng) return;

        for (var i = mapsInstance.length - 1; i >= 0; i--) {
            var layer = mapsInstance[i].markersLayers[_this.serviceLayer];
            if (layer){
                for (var j in layer._layers) {
                    if (layer._layers[j].id === "__wrongMarker"){
                        var wrongLatLng = layer._layers[j]._latlng;
                        
                        mapsInstance[i].crs.projection.dX = wrongLatLng.lng - rightLatLng.lng;
                        mapsInstance[i].crs.projection.dY = wrongLatLng.lat - rightLatLng.lat;

                        // Save corrections in maps
                        _this.saveCorrectionInMaps(mapsInstance[i].mapTilesLayer.mapName, mapsInstance[i].crs.projection.dX, mapsInstance[i].crs.projection.dY)

                        mapsInstance[rightMapNumber].map.fireEvent("dragend");

                    }
                };
            }
        };

        _this.removeMarkers();
        _this.hideMenu();
     }

    this.removeCorrectionFromMaps = function(){
        var activeMapNum = opt.getOption("appVars", "activeMapNum");
        for (var i = mapsInstance.length - 1; i >= 0; i--) {
            mapsInstance[i].crs.projection.dX = 0;
            mapsInstance[i].crs.projection.dY = 0;

            // Save corrections in maps
            _this.saveCorrectionInMaps(mapsInstance[i].mapTilesLayer.mapName, 0, 0)
        };

        mapsInstance[activeMapNum].$map.removeClass("coordscorrection");

        mapsInstance[activeMapNum].map.fireEvent("dragend");
        _this.removeMarkers();

     }

    this.saveCorrectionInMaps = function(mapName, dX, dY) {
        if (opt.getOption("global", "coordsCorrectionSaveInMaps")){
            var map = opt.getOption("maps", mapName);
            
            if (!map) return;

            map.dX = dX;
            map.dY = dY;

            opt.setOption("maps", mapName, map);
        }
     }

    this.init();

 }}());

var MarkersTable = (function(){

    window.opt = new Options();

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

    var _this = this;

    this.$tableContainer = $("#markersTable");
    this.$table = $("#markersTable_table");

    this.init = function(){

     };

    this.colsSelectForm = function() {

        var vals = {};
        var arr = [];
        $.each(this.$table.fnSettings().aoColumns, function(i, v){
            arr.push(
                { 
                    "type": "markersTable_columnsSelect_" + v.mData,   
                    "name": v.mData, 
                    "val": v.bVisible, 
                    "loc": "markers:formEditMarker_" + v.mData,
                    "description": v.mData
                }
            )
        })

        arr.push(
            { "type": "markersTable_columnsSelect_submit", "loc": "univers:submit", callback: function(form){
                _this.setColsVisible(form.data);
                form.hideForm();
            }}
        );     

        var eform = new FoundationForm(arr, "markersTable_columnsSelect");   
     };

    this.setColsVisible = function(data) {
        console.log(data);
        $.each(this.$table.fnSettings().aoColumns, function(i, v){
            _this.$table.fnSetColumnVis( i, data[v.mData] ? true : false );
        });
     };

    this.showTable = function() {

        var data = opt.getOption("markers");
        var dataNormalize = [];
        for (var i in data) {
            var mark = {
                id: data[i].id,
                title: data[i].title || " ",
                tags: data[i].tags || " ",
                icon: data[i].icon ? "<img src='{0}'></img>".format(data[i].icon): " ",
                layer: data[i].layer || " ",
                dateStart: data[i].dateStart || " ",
                dateEnd: data[i].dateEnd || " ",
                links: data[i].links || " ",
                latlng: data[i].latlng || " ",                
            }

            dataNormalize.push(mark);
        };

        // Add more cols:
        // - Add here
        // - Add dataNormalize
        // - Add #markersTable cols
        // - Add #markersTable_columnsSelect row

        _this.$table.dataTable({
            "bRetrieve": true,
            "sScrollX": "100%",
            "bScrollCollapse": true,       
            "aoColumns": [
                { "mData": "id",         "sTitle": loc("markers:formEditMarker_id"),    "bVisible": false, "bSearchable": false,},
                { "mData": "title",      "sTitle": loc("markers:formEditMarker_title"),      "bSortable": true },
                { "mData": "tags",       "sTitle": loc("markers:formEditMarker_tags"),       "bSortable": true },
                { "mData": "icon",       "sTitle": loc("markers:formEditMarker_icon"),       "bSortable": true },
                { "mData": "layer",      "sTitle": loc("markers:formEditMarker_layer"),      "bSortable": true },
                { "mData": "dateStart",  "sTitle": loc("markers:formEditMarker_dateStart"),  "bSortable": true, "bVisible": false, "bSearchable": false },
                { "mData": "dateEnd",    "sTitle": loc("markers:formEditMarker_dateEnd"),    "bSortable": true, "bVisible": false, "bSearchable": false },
                { "mData": "links",      "sTitle": loc("markers:formEditMarker_links"),      "bSortable": true, "bVisible": false },
                { "mData": "latlng",     "sTitle": loc("markers:formEditMarker_latlng"),     "bSortable": true, "bVisible": false, "bSearchable": false },
            ],
            "aaData": dataNormalize,
            "sDom": '<"top"fl<"button markersTable_columnsSelect_button">>t<"bottom"ip>',
        });

        $(".markersTable_columnsSelect_button").click(function(){
            _this.colsSelectForm();
        })

        // TODO: touch
        _this.$table.find('tbody tr').click(function(){
            var nTds = $('td', this);
            var id = $(nTds[0]).text();
            
            var latlng = opt.getOption("markers", id).latlng;

            mapsInstance[opt.getOption("appVars", "activeMapNum")].moveAllMaps(latlng);
        })

        _this.$tableContainer.arcticmodal({
            afterClose: function(){
                // _this.$table.dataTable({
                //     "bFilter": false,
                //     "bDestroy": true
                // });
            }
        });

     };

    this.init();

 }}());
 