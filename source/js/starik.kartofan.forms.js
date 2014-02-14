"use strict"

var TopMenu = (function(){

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

    window.opt = new Options();
    window.mapseditor = new MapsEditor();
    window.stageeditor = new StageEditor();
    window.fastmoving = new FastMoving();
    window.bases = new Bases();
    window.gps = new GPS();
    window.infomenu = new InfoMenu();
    window.hotkeys = new HotKeys();
    window.coordscorrection = new CoordsCorrection();
    window.markerstable = new MarkersTable();

    var _this = this;

    this.topMenuId = arguments[0];
    // this.mapsContainerId = arguments[1];

    // if (!this.topMenuId || !this.mapsContainerId) return;
    if (!this.topMenuId) return;

    this.topMenuArray = [
        { type: "topMenuMenu", loc: "topMenu:topMenuMenu" },

        { type: "topMenuMaps", loc: "topMenu:topMenuMaps" },
        { type: "topMenuMapSet", loc: "topMenu:topMenuMapSet", callback: mapseditor.setMapMenu },
        { type: "topMenuMapEdit", loc: "topMenu:topMenuMapEdit", callback: mapseditor.editMapMenu },
        { type: "topMenuMapExternal", loc: "topMenu:topMenuMapExternal", callback: mapseditor.externalMapMenu },
        { type: "topMenuMapSave", loc: "topMenu:topMenuMapSave", callback: mapseditor.editMapActiveWindow },
        
        { type: "topMenuStages", loc: "topMenu:topMenuStages" },
        { type: "topMenuStageSet", loc: "topMenu:topMenuStageSet", callback: stageeditor.setStageMenu },
        { type: "topMenuStageEdit", loc: "topMenu:topMenuStageEdit", callback: stageeditor.editStageMenu },
        { type: "topMenuStageExternal", loc: "topMenu:topMenuStageExternal", callback: stageeditor.externalStageMenu },
        { type: "topMenuStageEditView", loc: "topMenu:topMenuStageEditView", callback: stageeditor.editView },
        { type: "topMenuStageSave", loc: "topMenu:topMenuStageSave", callback: stageeditor.saveStage },
        { type: "topMenuStageExport", loc: "topMenu:topMenuStageExport", callback: stage.exportImageView },
        
        { type: "topMenuMarkers", loc: "topMenu:topMenuMarkers" },
        { type: "topMenuMarkersAddMarker", loc: "topMenu:topMenuMarkersAddMarker", callback: function(){opt.setAddMarkerOn()} },
        { type: "topMenuMarkersSaveFilter", loc: "topMenu:topMenuMarkersSaveFilter", callback: function(){markerstable.storeFilter()} },
        { type: "topMenuMarkersLoadFilter", loc: "topMenu:topMenuMarkersLoadFilter", callback: function(){markerstable.loadFilterMenu()} },
        { type: "topMenuMarkersDeleteFilter", loc: "topMenu:topMenuMarkersDeleteFilter", callback: function(){markerstable.deleteFilterMenu()} },
        { type: "topMenuMarkersDeleteReset", loc: "topMenu:topMenuMarkersDeleteReset", callback: function(){markerstable.loadFilter({}); opt.refreshAllMarkers();} },
        // { type: "topMenuMarkersEdit", loc: "topMenu:topMenuMarkersEdit", callback: function(){} },
        // { type: "topMenuMarkersExternal", loc: "topMenu:topMenuMarkersExternal", callback: function(){} },
        // { type: "topMenuMarkersEditView", loc: "topMenu:topMenuMarkersEditView", callback: function(){} },
        // { type: "topMenuMarkersSave", loc: "topMenu:topMenuMarkersSave", callback: function(){} },
        { type: "topMenuMarkersExport", loc: "topMenu:topMenuMarkersExport", callback: function(){opt.exportMarkersFilteredJSON("markers.json")} },
        { type: "topMenuMarkersExportAll", loc: "topMenu:topMenuMarkersExportAll", callback: function(){opt.exportAllInJSON(["markers", "markersDescriptions"], "markers.json")} },

        { type: "topMenuMove", loc: "topMenu:topMenuMove" },
        { type: "topMenuMoveMove", loc: "topMenu:topMenuMoveMove", callback: fastmoving.moveToPointMenu },
        { type: "topMenuMoveAdd", loc: "topMenu:topMenuMoveAdd", callback: fastmoving.editPoint },
        { type: "topMenuMoveEdit", loc: "topMenu:topMenuMoveEdit", callback: fastmoving.editPointMenu },
        
        { type: "topMenuUtils", loc: "topMenu:topMenuUtils" },
        { type: "topMenuUtilsToggleFulscreen", loc: "topMenu:topMenuUtilsToggleFulscreen", callback: mapseditor.toggleFullScreen },
        { type: "topMenuUtilsToggleMeasuring", loc: "topMenu:topMenuUtilsToggleMeasuring", callback: mapseditor.toggleMeasuring },
        { type: "topMenuUtilsFastNotes", loc: "topMenu:topMenuUtilsFastNotes", callback: opt.fastNotesEditor },
        { type: "topMenuUtilsCoordsCorrection", loc: "topMenu:topMenuUtilsCoordsCorrection", callback: coordscorrection.showMenu },
        { type: "topMenuUtilsMarkersTable", loc: "topMenu:topMenuUtilsMarkersTable", callback: markerstable.showTable },
        
        { type: "topMenuOptUpdate", loc: "topMenu:topMenuOptUpdate", callback: bases.syncIn },
        { type: "topMenuOptLang", loc: "topMenu:topMenuOptLang", callback: opt.setLang },
        { type: "topMenuOptReset", loc: "topMenu:topMenuOptReset", callback: bases._clearAllBases },
        
        { type: "topMenuJSON", loc: "topMenu:topMenuJSON" },
        { type: "topMenuJSONMaps", loc: "topMenu:topMenuJSONMaps", callback: function(){opt.getAllDataFromJSON("maps")} },
        { type: "topMenuJSONStages", loc: "topMenu:topMenuJSONStages", callback: function(){opt.getAllDataFromJSON("stages")} },
        { type: "topMenuJSONMoves", loc: "topMenu:topMenuJSONMoves", callback: function(){opt.getAllDataFromJSON("points")} },
        { type: "topMenuJSONAll", loc: "topMenu:topMenuJSONAll", callback: function(){opt.getAllDataFromJSON()} },
        { type: "topMenuJSONExport", loc: "topMenu:topMenuJSONExport", callback: function(){opt.exportAllInJSON();} },
        { type: "topMenuJSONRawText", loc: "topMenu:topMenuJSONRawText", callback: opt.getRawDataFromJSON },
        
        { type: "topMenuGPS", loc: "topMenu:topMenuGPS" },
        { type: "topMenuGPSStart", loc: "topMenu:topMenuGPSStart", callback: gps.startGPS },
        { type: "topMenuGPSStop", loc: "topMenu:topMenuGPSStop", callback: gps.stopGPS },
        
        { type: "topMenuHelp", loc: "topMenu:topMenuHelp" },
        { type: "topMenuHelpComments", loc: "topMenu:topMenuHelpComments", callback: function(){$("#disqus_thread").arcticmodal()} },
        { type: "topMenuHelpBlog", loc: "topMenu:topMenuHelpBlog" },
        { type: "topMenuHelpFAQ", loc: "topMenu:topMenuHelpFAQ" },
        { type: "topMenuHelpSource", loc: "topMenu:topMenuHelpSource" },
        { type: "topMenuHelpHotkeys", loc: "topMenu:topMenuHelpHotkeys", callback: function() { hotkeys.showInfo() } },
        { type: "topMenuHelpUpdates", loc: "topMenu:topMenuHelpUpdates" /* callback in opt.versionCheck */},
        { type: "topMenuHelpTourMain", loc: "topMenu:topMenuHelpTourMain", callback: function() { opt.startTour() } },
        { type: "topMenuVersion", text: function(){return "version "+opt.getOption("appVars", "version")} },
        
        { type: "topMenuOpt", loc: "topMenu:topMenuOpt" },

        // Settings
        { 
            type: "topMenuOptHashChange", 
            loc: "topMenu:topMenuOptHashChange", 
            callback: function(){
                opt.setOption("current", "hashChange", 1-opt.getOption("current", "hashChange"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "hashChange") }
         },
        { 
            type: "topMenuOptMapsSyncMoving", 
            loc: "topMenu:topMenuOptMapsSyncMoving", 
            callback: function(){
                opt.setOption("current", "mapSyncMoving", 1-opt.getOption("current", "mapSyncMoving"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "mapSyncMoving") }
         },
        { 
            type: "topMenuOptMapSyncZooming", 
            loc: "topMenu:topMenuOptMapSyncZooming", 
            callback: function(){
                opt.setOption("current", "mapSyncZooming", 1-opt.getOption("current", "mapSyncZooming"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "mapSyncZooming") }
         },
        { 
            type: "topMenuOptMapCursorAllMapsVisible", 
            loc: "topMenu:topMenuOptMapCursorAllMapsVisible", 
            callback: function(){
                opt.setOption("current", "mapCursorAllMapsVisible", 1-opt.getOption("current", "mapCursorAllMapsVisible"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "mapCursorAllMapsVisible") }
         },
        { 
            type: "topMenuOptViewInfoPanelShowAlways", 
            loc: "topMenu:topMenuOptViewInfoPanelShowAlways", 
            callback: function(){
                opt.setOption("current", "viewInfoPanelShowAlways", 1-opt.getOption("current", "viewInfoPanelShowAlways"));
                infomenu._updateInfoMenuView();
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "viewInfoPanelShowAlways") }
         },         
        { 
            type: "topMenuOptDbSyncIn", 
            loc: "topMenu:topMenuOptDbSyncIn", 
            callback: function(){
                opt.setOption("current", "dbSyncIn", 1-opt.getOption("current", "dbSyncIn"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "dbSyncIn") }
         },
        { 
            type: "topMenuOptDbSyncOut", 
            loc: "topMenu:topMenuOptDbSyncOut", 
            callback: function(){
                opt.setOption("current", "dbSyncOut", 1-opt.getOption("current", "dbSyncOut"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "dbSyncOut") }
         },
        { 
            type: "topMenuOptGpsAutoStart", 
            loc: "topMenu:topMenuOptGpsAutoStart", 
            callback: function(){
                opt.setOption("gps", "gpsAutoStart", 1-opt.getOption("gps", "gpsAutoStart"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("gps", "gpsAutoStart") }
         },
        { 
            type: "topMenuOptSHowMarkers", 
            loc: "topMenu:topMenuOptSHowMarkers", 
            callback: function(){
                opt.setOption("current", "markersShow", 1-opt.getOption("current", "markersShow"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("current", "markersShow") }
         },  
        { 
            type: "topMenuOptSaveCorrections", 
            loc: "topMenu:topMenuOptSaveCorrections", 
            callback: function(){
                opt.setOption("global", "coordsCorrectionSaveInMaps", 1-opt.getOption("global", "coordsCorrectionSaveInMaps"));
                _this.setActiveOnButtons();
            },
            active: function() { return opt.getOption("global", "coordsCorrectionSaveInMaps") }
         },                 
        { 
            type: "topMenuMapCachedService", 
            loc: "topMenu:topMenuMapCachedService", 
            callback: function(){
                var newVal = prompt(loc("topMenu:topMenuInputNewValueQueation"), opt.getOption("global", "mapCachedService"));
                if (newVal){
                    opt.setOption("global", "mapCachedService", newVal);
                }
            }
         },
        { 
            type: "topMenuMapDefaultCenterLatLng", 
            loc: "topMenu:topMenuMapDefaultCenterLatLng", 
            callback: function(){
                var newVal = prompt(loc("topMenu:topMenuInputNewValueQueation"), opt.getOption("global", "mapDefaultCenterLatLng"));
                if (newVal){
                    newVal = newVal.split(",");
                    newVal.length = 2;
                    opt.setOption("global", "mapDefaultCenterLatLng", newVal);
                }
            }
         },   
        { 
            type: "topMenuMapDefaultURL", 
            loc: "topMenu:topMenuMapDefaultURL", 
            callback: function(){
                var newVal = prompt(loc("topMenu:topMenuInputNewValueQueation"), opt.getOption("global", "mapDefaultURL"));
                if (newVal){
                    opt.setOption("global", "mapDefaultURL", newVal);
                }
            }
         },   
        { 
            type: "topMenuMainFeed", 
            loc: "topMenu:topMenuMainFeed", 
            callback: function(){
                var newVal = prompt(loc("topMenu:topMenuInputNewValueQueation"), opt.getOption("global", "mainFeed"));
                if (newVal){
                    opt.setOption("global", "mainFeed", newVal);
                }
            }
         },                                       
        { type: "topMenuSetCache", loc: "menuCache:topMenuSetCache", callback: function(){opt.setCacheMenu()} },

        // Pin Button
        { 
            type: "topMenuPin", 
            callback: function(){_this.toggleAlwaywMenuPin()},
            active: function() { return opt.getOption("current", "viewTopMenuShowAlways") }
         },
        

        { type: "topMenuStageEditor", loc: "topMenuStageEditor:topMenuStageEditor" },
        { type: "topMenuStageEditorSaveView", loc: "topMenuStageEditor:topMenuStageEditorSaveView", callback: stageeditor.saveView },
        { type: "topMenuStageEditorAddMap", loc: "topMenuStageEditor:topMenuStageEditorAddMap", callback: stageeditor.addMapToStage },
        { type: "topMenuStageEditorRemoveMap", loc: "topMenuStageEditor:topMenuStageEditorRemoveMap", callback: stageeditor.removeMapFromStage },
        { type: "topMenuStageEditorEditControls", loc: "topMenuStageEditor:topMenuStageEditorEditControls", callback: stageeditor.editMapsControls },
        { type: "topMenuStageEditorToggleBlockZoom", loc: "topMenuStageEditor:topMenuStageEditorToggleBlockZoom", callback: stageeditor.blockActiveMapZoom },

        { type: "topMenuCoordsCorrection", loc: "topMenuCoordsCorrection:topMenuCoordsCorrection" },
        { type: "topMenuCoordsCorrectionAddRight", loc: "topMenuCoordsCorrection:topMenuCoordsCorrectionAddRight", callback: coordscorrection.addRightMarker },
        { type: "topMenuCoordsCorrectionAddWrong", loc: "topMenuCoordsCorrection:topMenuCoordsCorrectionAddWrong", callback: coordscorrection.addWrongMarker },
        { type: "topMenuCoordsCorrectionRemoveMarkers", loc: "topMenuCoordsCorrection:topMenuCoordsCorrectionRemoveMarkers", callback: coordscorrection.removeMarkers },
        { type: "topMenuCoordsCorrectionSaveCorrections", loc: "topMenuCoordsCorrection:topMenuCoordsCorrectionSaveCorrections", callback: coordscorrection.addCorrectionOnMaps },
        { type: "topMenuCoordsCorrectionDropCorrectionSelect", loc: "topMenuCoordsCorrection:topMenuCoordsCorrectionDropCorrectionSelect", callback: coordscorrection.removeCorrectionFromMaps },
        { type: "topMenuCoordsCorrectionClose", loc: "topMenuCoordsCorrection:topMenuCoordsCorrectionClose", callback: coordscorrection.hideMenu },

     ];

    this.showTopMenuView = function() {
        // var $mapsContainer = $("#"+_this.mapsContainerId);
        var $topMenuContainer = $("#"+_this.topMenuId);

        // $mapsContainer.css({"top": 45+"px"});
        // $topMenuContainer.css({"z-index": 9999, "top": 0+"px"});
        $topMenuContainer.removeClass("hide");

        // TODO: этот ресайз сделать чтобы действовал на фрейм когда встроено в окно
        window.onresize();        
     }

    this.hideTopMenuView = function() {
        if (opt.getOption("current", "viewTopMenuShowAlways")) return;

        // var $mapsContainer = $("#"+_this.mapsContainerId);
        var $topMenuContainer = $("#"+_this.topMenuId);

        // $mapsContainer.css({"top": "0px"});
        // $topMenuContainer.css({"z-index": 0, "top": "-45px"});

        $topMenuContainer.addClass("hide");

        // TODO: этот ресайз сделать чтобы действовал на фрейм когда встроено в окно
        window.onresize();        
     }

    this.showStageMenu = function() {
        var $stageMenu = $("#topMenuStageEditor");
        $stageMenu.removeClass("hide-for-small-only hide-for-medium-up hide-for-large-up hide-for-xlarge-up hide-for-xxlarge-up")
     }

    this.hideStageMenu = function() {
        var $stageMenu = $("#topMenuStageEditor");
        $stageMenu.addClass("hide-for-small-only hide-for-medium-up hide-for-large-up hide-for-xlarge-up hide-for-xxlarge-up")
     }

    this.toggleAlwaywMenuPin = function() {
        opt.setOption("current", "viewTopMenuShowAlways", 1 - opt.getOption("current", "viewTopMenuShowAlways"));

        this.setActiveOnButtons();
        this._updateTopMenuView();
     }

    this.setActiveOnButtons = function() {

        $.each(_this.topMenuArray, function(i, v){
            if (typeof v.active == "function" && v.active()){ 
                $("."+v.type).parent().addClass("active") 
            }
            else { 
                $("."+v.type).parent().removeClass("active") 
            }            
        })
     }

    this._updateTopMenuView = function() {

        var topMenuVisible = opt.getOption("current", "viewTopMenuShowAlways");

        topMenuVisible ? this.showTopMenuView() : this.hideTopMenuView();

     }

    this._setLocalization = function() {
        var $topMenu = $("#"+this.topMenuId);

        $.each(this.topMenuArray, function(i, v) {

            var $elements,
                local,
                text;

            if (v.loc || v.text) $elements = $topMenu.find("."+v.type);
            if (v.loc) local = loc(v.loc, "", "", $elements.html());
            if (v.text) text = v.text();

            if (v.loc || v.text) {
                $.each($elements, function(){
                    var $el = $(this);
                    if ($el.html() && (local || text) && $el.html() == $el.text()){
                        $el.html(text || local);
                    }
                })                
            }

        })
     }

    this._setFunctions = function() {
        var $topMenu = $("#"+this.topMenuId);

        $.each(this.topMenuArray, function(i, v) {
            if (v.callback) {
                // TODO: touch
                $topMenu.find("."+v.type).click(v.callback);
            }
        })
     }

    // Collapse when click on menu
    // TODO: touch
    this.closeOnClickEvent = function(){
        $('.top-bar section ul, #kf_mapsContainer').click(function() {
            $('.top-bar, [data-topbar]').css('height', '').removeClass('expanded');
        });
        $('.top-bar section ul li').click(function() {
            $(this).siblings().removeClass('hover');
        });        
     }

    this._setLocalization();
    this._setFunctions();
    this._updateTopMenuView();
    this.setActiveOnButtons();
    this.closeOnClickEvent();

 }}());

var InfoMenu = (function(){

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

    window.opt = new Options();

    var _this = this;

    this.infoMenuArray = [];
    this.$coords = $("#kf_bottomMenu .infoMenuLatLng");
    this.$version = $("#kf_bottomMenu .infoMenuVersion");
    this.$cache = $("#kf_bottomMenu .infoMenuCache");

    this._init = function() {
        this._updateInfoMenuView();
        this.setRight();
     }

    this.showInfoMenuView = function() {
        opt.setOption("appVars", "viewInfoMenu", true);
        _this._updateInfoMenuView();
     }

    this.hideInfoMenuView = function() {
        opt.setOption("appVars", "viewInfoMenu", false);
        _this._updateInfoMenuView();
     }

    this._updateInfoMenuView = function(){

        var infoVisible = opt.getOption("appVars", "viewInfoPanel") == undefined ? opt.getOption("current", "viewInfoPanelShowAlways") : opt.getOption("appVars", "viewInfoPanel");

        // var $mapsContainer = $("#containerKartofan");
        var $infoContainer = $("#kf_bottomMenu");

        // var bottom = infoVisible ? 15 : 0;
        // $mapsContainer.css({"bottom": bottom+"px"});
        infoVisible ? $infoContainer.removeClass('hide') : $infoContainer.addClass('hide');

        // TODO: этот ресайз сделать чтобы действовал на фрейм когда встроено в окно
        window.onresize();
     }

    this.setCoords = function(latlng){
        var text = latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5);
        this.$coords.text(text);
     }

    this.setRight = function() {
        this.$version.text("v."+opt.getOption("appVars", "version"));

        var cache;
        switch (opt.getOption("current", "mapCacheLoad")) {
            case "internet":
                cache = "<span class='icon-world'></span>";
                break;
            case "cache":
                cache = "<span class='icon-folder'></span>";
                break;
            case "internet+cache":
                cache = "<span class='icon-world'></span><span class='icon-folder'></span>";
                break;
            case "cache+internet":
                cache = "<span class='icon-folder'></span><span class='icon-world'></span>";
                break;
            default:
                cache = "????";
        }
        this.$cache.html(cache)
     }

    this._init();

 }}());

/**
    arr = [
        "group": {
            id: {
                title: "", 
                callback: function
            }
        }
    ]
*/
var AccordionMenu = function(arr, id, closeOnEsc) {

    if (arr == undefined || typeof arr != "object" || $.isEmptyObject(arr)){ return }
    if (!id) {id = "nonamemenu"}

    var _this = this;

    this.$container;
    this.$menu;
    this.arr = arr;

    this._initMenu = function(){
        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$container = $("div"+$id);
        this.$container.empty();
        this.$container.append("<dl class='accordion' data-accordion></dl>");

        this.$container.arcticmodal({
            closeOnEsc: closeOnEsc ? false : true,
            closeOnOverlayClick: closeOnEsc ? false : true,
            afterClose: function(){
                _this.$container.empty();
            }
        });
     }

    this._generateAccordeon = function() {
        var $accordion = this.$container.find(".accordion");
        var count = 0;
        $.each(this.arr, function(i, v){

            var active = Object.keys(_this.arr).length === 1 ? "active" : "";
            
            var $accordionHtml = $("<dd><a href='#accordion{0}'>{1}</a>\
            <div id='accordion{0}' class='content {2}'></div></dd>"
            .format([count, i, active]));

            var rows = [];
            $.each(v, function(j, data){
                rows.push('<div class="row" id="{0}">\
                    <div class="small-12 large-12 columns">\
                    {1}</div></div>'.format(["menuItem"+count, data.title]));
                count++;
            });

            $accordionHtml.find(".content").html(rows.join(""));
            $accordion.append($accordionHtml);
        });

        $(document).foundation();
     }

    this._setCallbacks = function() {
        var count = 0;
        $.each(this.arr, function(i, v){
            $.each(v, function(j, data){
                $("#menuItem"+count).click(function(){
                    if (!closeOnEsc) _this.$container.arcticmodal('close');
                    data.callback(j);
                })
                count++;
            });
        });
     }

    this._initMenu();
    this._generateAccordeon();
    this._setCallbacks();
 }

var FoundationForm = function(arr, id, onOpen, onClose) {
    if (arr == undefined || typeof arr != "object" || $.isEmptyObject(arr)){ return }
    if (!id) return;

    var _this = this;

    this.$form;
    this.arr = arr; 
    this.data = {};
    this.checkFormFlag = true;

    this.onOpen = onOpen;
    this.onClose = onClose;
    
    this._initForm = function(){
        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
            this.$form = $("div"+$id);
            this.$form.empty();
            this.$form.append("<form></form>");
        }
        else {
            this.$form = $("div"+$id);
        }

        this.clearForm();
        this.showForm();
     }

    this.clearForm = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem;

            $elem = _this.$form.find("input."+v.type+", select."+v.type+", textarea."+v.type);
            if ($elem.length) {
                $elem.val("");
                $elem.html("");                
            };

            $elem = _this.$form.find("a."+v.type);
            if ($elem.length) {
                $elem.off("click");
            }
        })        
     }

    this.setLocalization = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem = _this.$form.find("span."+v.type+", label."+v.type+", a."+v.type);
            if (!$elem.length || !v.loc) return;
            $elem.html(loc(v.loc));
        })
     }

    this.setValues = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;

            var $elem = _this.$form.find("input."+v.type+", select."+v.type+", textarea."+v.type);
            if (!$elem.length) return;

            $elem.prop("checked", !!v.val);
            if (v.val != undefined) $elem.val(v.val);

        });
     }

    this.setOptions = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem;

            $elem = _this.$form.find("input."+v.type);
            if ($elem.length && v.options && typeof v.options == "object" && v.options.length){
                $elem.attr("list", v.type+"_list");
                var $datalist = $("<datalist></datalist>").attr("id", v.type+"_list");
                $elem.parent().append($datalist);
                $.each(v.options, function(j, option){
                    $datalist.append("<option>"+option+"</option>");
                });
            }

            $elem = _this.$form.find("select."+v.type);
            if ($elem.length && v.options && typeof v.options == "object" && v.options.length){
                $.each(v.options, function(j, option){
                    $elem.append("<option>"+option+"</option>");
                });
            }

        });

     }

    this.setCallbacks = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem = _this.$form.find("a."+v.type);
            if (!$elem.length || v.callback == undefined) return;
            // TODO: touch
            $elem.on("click", function(){
                _this.checkForm();
                _this.getValues();
                v.callback(_this);
            });
        })        
     }

    this.checkForm = function() {
        this.$form.find("form").submit();
        var $errors = this.$form.find("[data-invalid]");
        this.checkFormFlag = !$errors.length;
     }

    this.getValues = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;

            var $elem = _this.$form.find("input."+v.type+", select."+v.type+", textarea."+v.type);
            if (!$elem.length || !v.name) return;

            _this.data[v.name] = $elem.prop("type") == "checkbox" ? !!$elem.prop("checked") : $elem.val();            
        });
     }

    this.showForm = function() {
        this.$form.removeClass("hide");
        this.$form.arcticmodal({
            afterClose: function(){
                _this.$form.addClass("hide");
                _this.onClose ? _this.onClose() : undefined;
            }
        });        
        this.onOpen ? this.onOpen() : undefined;
     }

    this.hideForm = function() {
        this.$form.arcticmodal("close");
     }

    this._initForm();
    this.setLocalization();
    this.setOptions();
    this.setValues();
    this.setCallbacks();
    this.checkForm();
    this.getValues();
}
