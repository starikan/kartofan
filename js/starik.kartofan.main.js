"use strict"

var LeafletMap = function(mapId, opt){

    if (!mapId && !$("#"+mapId)){ return }
    this.mapId = mapId;

    if (!opt) { 
        console.log("There is no options in LeafletMap, check this.");
        return;
     }

    var parent = this;

    this.mapTilesLayer; // copy of LeafletTiles class
    this.marksLayer; 

    this.map;

    this.zoomControl;
    this.scaleControl;
    this.copyrightControl;
    this.nameControl;
    this.zoomLevelControl;

    this.moveAllMaps = function(latlng){
        for (var i = 0; i < parent.instances.length; i++) {
            parent.instances[i].setMapCenter(latlng);
        };        
     }

    this.onMapMoveEnd = function(e){
        if (!parent.map){return}

        var latlng = parent.map.getCenter();
        opt.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);   
        opt.setHash();
        
        if (opt.getOption("global", "mapSyncMoving")){
            parent.moveAllMaps(latlng);
        }
     }

    this.onZoomEnd = function(e){
        if (!parent.map) { return }
        this.setMapZoom(parent.map.getZoom());
        this.onMapMoveEnd();
     }

    this.updateMapControls = function(){
        if (!this.map) { return }

        if (this.zoomLevelControl){
            this.zoomLevelControl.setPrefix(this.map.getZoom());
        }

        var title;
        try { title = this.mapTilesLayer.title; }
        catch (e) { title = "No title" }

        if (this.nameControl){
            this.nameControl.setPrefix(title);
        }
     }

    this._setMapControls = function(){

        if (!this.map) { return }

        // Zoom Control
        if (opt.getOption("global", "viewControlsZoom")){
            this.zoomControl = L.control.zoom(opt.getOption("global", "viewControlsZoomPosition"))
            this.map.addControl(this.zoomControl);
         }

        // Scale Control
        if (opt.getOption("global", "viewControlsScale")){
            this.scaleControl = L.control.scale({
                position: opt.getOption("global", "viewControlsScalePosition"),
                imperial: opt.getOption("global", "viewControlsScaleMiles"),
            })
            this.map.addControl(this.scaleControl);
         }

        // Cporyright
        if (opt.getOption("global", "viewControlsInfoCopyright")){
            this.copyrightControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoCopyrightPosition"),
                prefix: opt.getOption("global", "viewControlsInfoCopyrightText"),
            })
            this.map.addControl(this.copyrightControl);
         }   

        // Map Title
        if (opt.getOption("global", "viewControlsInfoName")){
            var title;
            try {
                title = this.mapTilesLayer.title;
            }
            catch (e) {
                title = "No title"
            }
            this.nameControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoNamePosition"),
                prefix: title,
            })
            this.map.addControl(this.nameControl);
         }  

        // Zoom Level
        if (opt.getOption("global", "viewControlsInfoZoom")){
            this.zoomLevelControl = L.control.attribution({
                position: opt.getOption("global", "viewControlsInfoZoomPosition"),
                prefix: this.map.getZoom(),
            })
            this.map.addControl(this.zoomLevelControl);
         }                   

     }

    this._validateLatLng = function(latlng){

        latlng = latlng ? latlng : opt.getOption("global", "mapDefaultCenterLatLng");

        try {
            latlng = L.latLng(latlng);
        }
        catch(e) {
            latlng = L.latLng(opt.getOption("global", "mapDefaultCenterLatLng"));
        }

        return latlng;
     }

    this._validateZoom = function(zoom){

        if (!this.mapTilesLayer){ return opt.getOption("global", "mapDefaultZoom") }

        zoom = zoom ? zoom : opt.getOption("global", "mapDefaultZoom");

        var minZoom = this.mapTilesLayer.minZoom;
        var maxZoom = this.mapTilesLayer.maxZoom;

        zoom = zoom>=minZoom && zoom<=maxZoom ? zoom : opt.getOption("global", "mapDefaultZoom");

        return zoom;

     }

    this.createMap = function(){
        this.map = L.map(this.mapId, {
            zoomControl: false,
            attributionControl: false,
            center: this._validateLatLng(opt.getOption("current", "mapCenterLatLng") || opt.getOption("global", "mapDefaultCenterLatLng")),
            zoom: this._validateZoom(opt.getOption("current", "mapZoom") || opt.getOption("global", "mapDefaultZoom")),
            inertia: false,
        });

        this.map.on("zoomend", function(e){ parent.onZoomEnd(); });
        // this.map.on("zoomend", this.onZoomEnd); // Srange but this not work in Chrome ??????
        this.map.on("dragend", this.onMapMoveEnd); // if I use moveend, on setting all maps position it`s fall to recursion a little

        this._setMapControls();
     }

    this.setMapCenter = function(latlng){
        if (!this.map){return}
        latlng = this._validateLatLng(latlng);
        this.map.panTo(latlng);
     }

    this.setMapZoom = function(zoom){
        if (!this.map){return}
        zoom = this._validateZoom(zoom);
        this.map.setZoom(zoom);
        this.updateMapControls();
     }
    
    this.setMapTilesLayer = function(layerObj){

        if (this.mapTilesLayer && this.map.hasLayer(this.mapTilesLayer)){
            this.map.removeLayer(this.mapTilesLayer)
        }

        this.mapTilesLayer = layerObj;
        this.map.addLayer(this.mapTilesLayer.layer);

        this.updateMapControls();

     }

    this.refreshMapAfterResize = function(){
        this.map.invalidateSize();
     }

    this.instances.push(this);

 }

LeafletMap.prototype.instances = []; // Collect all instanses of class

(function(){

    var openContextMenu = function(e){
        // http://www.quirksmode.org/dom/events/contextmenu.html
        var $mainmenu = $("#mainmenu");
        if (!$mainmenu.is(":visible")){
            $mainmenu.removeClass("hide");
        }
        return false;        
     }

    var closeContextMenu = function(e){
        var $mainmenu = $("#mainmenu");
        if ($mainmenu.is(":visible")){
            $mainmenu.addClass("hide");
        }
        return false; 
     }

    var initMainMenu = function(){
        $('#cssmenu > ul > li ul').each(function(index, e){
          var count = $(e).find('li').length;
          var content = '<span class="cnt">' + count + '</span>';
          $(e).closest('li').children('a').append(content);
        });
        $('#cssmenu ul ul li:odd').addClass('odd');
        $('#cssmenu ul ul li:even').addClass('even');
        $('#cssmenu > ul > li > a').click(function() {
          $('#cssmenu li').removeClass('active');
          $(this).closest('li').addClass('active'); 
          var checkElement = $(this).next();
          if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
            $(this).closest('li').removeClass('active');
            checkElement.slideUp('normal');
          }
          if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
            $('#cssmenu ul ul:visible').slideUp('normal');
            checkElement.slideDown('normal');
          }
          if($(this).closest('li').find('ul').children().length == 0) {
            return true;
          } else {
            return false;   
          }     
        });
     }

    var eventResizeWindow = function(e){
        for (var i=0; i<LeafletMap.prototype.instances.length; i++){
            LeafletMap.prototype.instances[i].refreshMapAfterResize();
        }
     }

    window.onresize = eventResizeWindow;
    document.oncontextmenu = openContextMenu;
    // TODO: touch event to context menu
    $("#container").bind("click", closeContextMenu);
    document.click = closeContextMenu;

    initMainMenu();
 })()

var LeafletTiles = function(opt){

    var parent = this;

    this.layer;

    this.server;
    this.tilesURL;
    this.maxZoom;
    this.minZoom;
    this.startZoom;
    this.title;

    if (!opt) { 
        console.log("There is no options in LeafletTiles, check this.");
        return;
     }

    // TODO: сделать проверку что это строка и ссылка
    this._validateTilesURL = function(url){
        if (url) {
            return url;
        }
        else {
            return "http://{s}.tiles.mapbox.com/v3/examples.map-y7l23tes/{z}/{x}/{y}.png";
        }
     }

    this._validateServer = function(server){
        return server && server in ["img", "wms"] ? server : "img";
     }

    this._validateMinZoom = function(minZoom){
        minZoom = parseInt(minZoom, 10);
        minZoom = minZoom<=18 && minZoom>0 ? minZoom : minZoom>18 ? 18 : 1; // If return 0 exept 1 all crashed
        return minZoom;
     }

    this._validateMaxZoom = function(maxZoom){
        maxZoom = parseInt(maxZoom, 10);
        maxZoom = maxZoom<=18 && maxZoom>0 ? maxZoom : 18;
        return maxZoom;
     }

    this._validateStartZoom = function(startZoom){
        startZoom = parseInt(startZoom, 10);
        startZoom = startZoom<=18 && startZoom>0 ? startZoom : opt.getOption("global", "mapDefaultZoom");
        return startZoom;
     }     

    this._validateZoomBounds = function(){
        if (!this.maxZoom || !this.minZoom) { return }

        if (this.maxZoom < this.minZoom) {
            this.maxZoom = this.minZoom;
        }
     }

    this.setLayerOptions = function(mapName){

        var data = opt.getOption("maps", mapName);

        if (!data) { return }

        this.server = this._validateServer(data.server);
        this.tilesURL = this._validateTilesURL(data.tilesURL);
        this.maxZoom = this._validateMaxZoom(data.maxZoom);
        this.minZoom = this._validateMinZoom(data.minZoom);
        this.startZoom = this._validateStartZoom(data.startZoom);
        this.title = data.title ? data.title : "Unknown Map";

        this._validateZoomBounds();
     }

    this.setLayer = function(url, minZoom, maxZoom, startZoom){

        // WMS server always set using the setLayerOptions
        this.server = this.server ? this.server : this._validateServer();
        this.tilesURL = url ? this._validateTilesURL(url): this.tilesURL;
        this.maxZoom = maxZoom ? his._validateMinZoom(maxZoom): this.maxZoom;
        this.minZoom = minZoom ? this._validateMaxZoom(minZoom): this.minZoom;
        this.startZoom = startZoom ? this._validateStartZoom(startZoom): this.startZoom;
        this.title = this.title ? this.title : "Unknown Map";

        this._validateZoomBounds();

        if (this.server && this.server === "wms"){
            // TODO: server wms type
        }
        else {
            this.layer = L.tileLayer(this.tilesURL, {
                maxZoom: this.maxZoom,
                minZoom: this.minZoom,
            });
        }
     }

 }

var Options = function(){

    var parent = this;

    this.global = {

        "mapDefaultCenterLatLng": [54.31727, 48.3946],
        "mapDefaultZoom": 12,
        "mapSyncMoving": true,
        "mapSyncZooming": false,

        "viewControlsZoom": true,
        "viewControlsZoomPosition": "topleft",
        "viewControlsScale": true,
        "viewControlsScalePosition": "bottomleft",
        "viewControlsScaleMiles": false,
        "viewControlsInfoName": true,
        "viewControlsInfoNamePosition": "bottomright",        
        "viewControlsInfoZoom": true,
        "viewControlsInfoZoomPosition": "bottomright",
        "viewControlsInfoCopyright": true,
        "viewControlsInfoCopyrightPosition": "bottomright",
        "viewControlsInfoCopyrightText": "Copyleft by Starik",

        "hashChange": true,

     };

    this.current = {
        "mapCenterLatLng": [],
        "mapZoom": undefined,

        "stage": {
            "stageName": "current",
            "stageMapsGrid": [
                [0, 0, 100, 50],
                [0, 50, 100, 50],
            ],
            "stageMapsNames": ["cloudmate", "cloudmate"],
            "stageMapsZooms": [12, 8],            
        },

     }

    this.maps = {
        "cloudmate": {
            tags: ["0. Современные онлайн карты"],
            src: "Internet",
            server: "img",
            title: 'Cloudmate',
            tilesURL: 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
            maxZoom: 15,
            minZoom: 0,
            startZoom: 5,        
        },
     };

    // TODO: написать
    this.initOptions = function(){

     }

    // TODO: нужна проверка наличия всех нужных глобальных переменных, если нет то принудительно обновлять
    // TODO: сделать проверку соответствия viewControlsZoomPosition и подобных определенным значениям
    this.checkOptions = function(){

     }     

    this.setOption = function(collection, option, value){
        this[collection][option] = value;
        // TODO: Update in localstorage and files in dropbox
     }

    this.getOption = function(collection, option){
        return this[collection][option];
     }

    this.setHash = function(){
        
        if (!this.getOption("global", "hashChange") || !this.getOption("global", "mapSyncMoving")) { 
            window.location.hash = "";
            return 
        }

        window.location.hash = this.getOption("current", "mapCenterLatLng").join(",");

     }

    this.getHash = function(){
        
        if (!this.getOption("global", "hashChange")) { return }

        var hash = window.location.hash;

        try {
            var latlng = L.latLng(hash.split("#").pop().split(","))
            this.setOption("current", "mapCenterLatLng", [latlng.lat, latlng.lng]);
        }
        catch (e) {}

     }    

    this.initOptions();

 }

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

var EditableForm = function(id){
    
    if (!id) { return; }

    this.$form;
    this.$formHeader;
    this.$formContent;

    this._initForm = function(id){

        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$form = $("div"+$id);

        this.$form.addClass("form-flat hide");

        if (!this.$form.find(".form-header").length){
            $("<div></div>").appendTo(this.$form).addClass("form-header");
        }

        if (!this.$form.find("div.form-content").length){
            $("<div></div>").appendTo(this.$form).addClass("form-content").append("<form/>");
        }

        this.$formHeader = $("div").find(".form-header");
        this.$formContent = $("div").find(".form-content > form");

        // console.log(this.$form, this.$formHeader, this.$formContent);
     }

    this.addHeader = function(header){
        if (!header){ return }
        this.$formHeader.append(header);
     }

    this.addInput = function(val, placeholder){

        if (!val){ val=undefined }

        $("<input/>").appendTo(this.$formContent).attr({
            "type": "text",
            "placeholder": placeholder,
            "value": val,
        });
     }

    this.addSubmit = function(val, id, extclass){
        if (!val){ val=undefined }
        if (!id){ id=undefined }
        if (!extclass){ extclass=undefined }

        $("<input/>").appendTo(this.$formContent).attr({
            "type": "submit",
            "value": val,
            "id": id,
        }).addClass("button").addClass(extclass);        
     }

    this.makeFromJSON = function(str){
        try {
            var json = JSON.parse(str);
        } catch (e) {
            return false;
        }

        if (!json.header){json.header = ""}
        if (!json.inputs || !json.inputs.length){json.inputs = []}
        if (!json.submit){json.header.val = ""}

        this.addHeader(json.header);
        for (var i=0, v=json.inputs; i<json.inputs.length; i++){
            this.addInput(v[i].val, v[i].placeholder);
        }
        for (var i=0, v=json.submit; i<json.submit.length; i++){
            this.addSubmit(v[i].val, v[i].id, v[i].extclass);
        }
     }
    
    this.showForm = function(){
        this.$form.removeClass("hide");
     }

    this.hideForm = function(){
        this.$form.addClass("hide");
     }

    this._initForm(id);

 }


var opt = new Options();
opt.getHash();

var stage = new StageMaps("container", opt);
stage.initStage();

var formJSON = {
    header: "Заголовок",
    inputs: [
        {val: "", placeholder: "text"},
        {val: "", placeholder: "text"},
        {val: "", placeholder: "text"},
        {val: "", placeholder: "text"},
    ],
    submit: [
        {val: "send", id: "sendForm", extclass: "sendForm"},
        {val: "cancel", id: "cancelForm", extclass: "cancelForm"},
    ]
}

var form = new EditableForm("eform");
form.makeFromJSON(JSON.stringify(formJSON));
form.showForm();