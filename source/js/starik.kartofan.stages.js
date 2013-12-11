"use strict"

var StageMaps = (function(){

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

    var parent = this;

    window.opt = new Options();
    window.mapvents = new Events();

    this.$container;
    this.currStage;

    this.initContainer = function(container){
        if (!container) { return }
        opt.setOption("html", "containerAllMapsId", container);
        this.$container = $("#"+container);
        this.createStage();
     }

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
 
 }}());

var StageEditor = (function(){

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

    var parent = this;

    window.opt = new Options();
    window.mapvents = new Events();
    window.stage = new StageMaps();

    var _errCorrect = function(x){

        var err = opt.getOption("global", "stageViewConstructorElasticSizeErrorPersent");

        var x1 = err * Math.floor(x/err);
        var x2 = err * Math.ceil(x/err);

        var d1 = Math.abs(x1 - x);
        var d2 = Math.abs(x2 - x);

        if (d2 >= d1) {
            return x1;
        }
        return x2;
     }

    var _getPersentPosition = function(div){

        var $container = $("#"+opt.getOption("html", "containerAllMapsId"));

        var widthContainer = $container.width();
        var heightContainer = $container.height();
        
        var $div = $(div);
        var widthDiv = $div.width();
        var heightDiv = $div.height();
        var topDiv = $div.position().top;
        var leftDiv = $div.position().left;                

        var newWidth = _errCorrect( 100 * widthDiv/widthContainer );
        var newHeight = _errCorrect( 100 * heightDiv/heightContainer );
        var newTop = _errCorrect( 100 * topDiv/heightContainer );
        var newLeft = _errCorrect( 100 * leftDiv/widthContainer );

        return {
            top: newTop,
            left: newLeft,
            width: newWidth,
            height: newHeight
        }
     }

    var onStop = function(){
        
        var $this = $(this);

        var pos = _getPersentPosition(this);

        $this.width(pos.width + "%").height(pos.height + "%")
        .css("top", pos.top + "%").css("left", pos.left + "%");

     }

    this.editView = function(){
        $.each(opt.getOption("current", "stage").stageMapsGrid, function(i, v){
            parent.editMapView(i)
        });
    
        mapvents.bindStageEditorMenu();
     }

    this.editMapView = function(i){

        $("#map"+i).draggable({ stop: onStop }).resizable({ stop: onStop });

        var map = window["map"+i];

        map.map.dragging.disable();
        map.map.scrollWheelZoom.disable();
        map.map.touchZoom.disable();

        // if (map.zoomControl) {map.map.removeControl(map.zoomControl)};
        // if (map.scaleControl) {map.map.removeControl(map.scaleControl)};
        // if (map.copyrightControl) {map.map.removeControl(map.copyrightControl)};
        // if (map.zoomLevelControl) {map.map.removeControl(map.zoomLevelControl)};
        
        // if (!map.nameControl) {map.nameControl = L.control.attribution({position: "bottomright" })}
        // map.nameControl.setPrefix("map"+i);

     }

    this.saveView = function(){

        var currStage = opt.getOption("current", "stage");

        currStage.stageMapsGrid = [];

        $.each($(".maps"), function(i, v){
            currStage.stageMapsGrid[i] = [];
            var $v = $(v)

            var pos = _getPersentPosition(v);

            currStage.stageMapsGrid[i].push(pos.left);
            currStage.stageMapsGrid[i].push(pos.top);
            currStage.stageMapsGrid[i].push(pos.width);
            currStage.stageMapsGrid[i].push(pos.height);

        });

        currStage.stageMapsNames.length = currStage.stageMapsGrid.length;
        currStage.stageMapsZooms.length = currStage.stageMapsGrid.length;
        currStage.stageMapsControlls.length = currStage.stageMapsGrid.length;

        opt.setOption("current", "stage", currStage, function(err, doc){
            if (!err){
                stage.createStage();
            }
        });

        mapvents.bindMainMenu();

     }

    this.addMapToStage = function(){

        var mapsCount = $(".maps").length;

        stage.addMapDiv(mapsCount, [25, 25, 50, 50]);
        stage.addMapObject(mapsCount);

        parent.editMapView(mapsCount);

     }

    this.removeMapFromStage = function(){
        var activeMap = opt.getOption("appVars", "activeMap");
        var mapsCount = $(".maps").length;

        if (mapsCount>1){ $("#"+activeMap).remove() }
     }  
        
    this.saveStage = function(){
        var allStages = opt.getOption("stages");
        var currStage = opt.getOption("current", "stage");

        console.log(allStages)

        var newName = prompt(loc("editStage:inputStageID"), currStage.title)
        if (newName){
            if (allStages[newName] && !confirm(loc("editStage:stageRewriteConfirm", newName))){
                return;
            }
            currStage.id = newName;
            opt.setOption("stages", newName, currStage);  
        }
     }  

    this.loadStage = function(title, stageData){
        // console.log(title!=undefined, stageData, opt.getOption("stages", title), opt.getOption("current", "stage"))
        stageData = opt.getOption("stages", title) ? opt.getOption("stages", title) : stageData ? stageData : opt.getOption("current", "stage");
        opt.setOption("current", "stage", stageData);
        // console.log(stageData)
        stage.createStage();
     }

    this.editStage = function(stageId){

        if (!stageId){ return }

        var stageVals = opt.getOption("stages", stageId);
        if (!stageVals){ return }
        stageVals.id = stageVals.id ? stageVals.id : stageId;

        eform = new EditableForm(mapvents.stageEditForm);
        eform.fillForm(stageVals);     
     }

    this.editMapsControls = function(){
        // TODOЖ сделать в суггкте номер карты
        var activeMap = opt.getOption("appVars", "activeMap");
        var mapNum = opt.getOption("appVars", "activeMapNum");
        var currStage = opt.getOption("current", "stage");

        var mapControlsForm = [
            { "type": "header", "val": "Choose Controls View" },
        ]

        // TODO: Localization
        $.each(opt.getOption("appVars", "mapsControlsList"), function(i, v){
            mapControlsForm.push({ "type": "checkbox", "id": v, "description": v })
        })

        mapControlsForm.push(
            { 
                "type": "button", 
                "val": "Update", 
                "id": "submit",
                "callback": function(form){
                    form.getAllData();
                    var data = form.data;
                    if (form.checkForm){
                        form.hideForm();
                        $.each(data, function(i, v){
                            currStage.stageMapsControlls[mapNum][i] = v;
                        })
                        opt.setOption("current", "stage", currStage);
                        window[activeMap].removeAllControls();
                        window[activeMap]._setMapControls();
                    }
                }
            },
            { 
                "type": "button", 
                "val": "Cancel", 
                "id": "cancel",
                "callback": function(form){form.hideForm()}
            }  
        )

        console.log(mapNum, currStage.stageMapsControlls[mapNum])

        var eform = new EditableForm(mapControlsForm);
        eform.fillForm(currStage.stageMapsControlls[mapNum]);
    }

 }}());