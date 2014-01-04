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

    this.$container;
    this.currStage;

    this.initContainer = function(container){
        if (!container) { return }
        this.$container = $("#"+container);
        this.createStage();
     }

    this.createStage = function(){
        this.$container.empty();
        this.currStage = opt.getOption("current", "stage");
        // console.log(this.currStage)
        if (!this.currStage.stageMapsGrid || !this.currStage.stageMapsGrid.length){ return }

        $.each(this.currStage.stageMapsGrid, function(i, v){
            parent.addMapDiv(i, v);
            parent.addMapObject(i);
        })
     }

    this.addMapDiv = function(i, v){
        var $mapDiv = $("<div></div>")
            .appendTo(parent.$container)
            .attr("id", "map"+i)
            .addClass("maps")
            .css("position", "absolute")
            .css("left", v[0]+"%")
            .css("top", v[1]+"%")
            .css("width", v[2]+"%")
            .css("height", v[3]+"%");

        $("<div></div>")
            .appendTo($mapDiv)
            .addClass("active-selector")
     }

    this.addMapObject = function(i){
        var names = this.currStage.stageMapsNames;
        var zooms = this.currStage.stageMapsZooms;

        if (mapsInstance[i]){
            mapsInstance[i] = new LeafletMap("map"+i);
        }
        else {
            window.mapsInstance.push(new LeafletMap("map"+i));
        }

        var latlng = opt.getOption("current","mapCenterLatLng");

        var zoom;
        try {
            zoom = zooms[i] || opt.getOption("maps",names[i]).startZoom;
        }
        catch(e) {
            zoom = opt.getOption("global", "mapDefaultZoom");
        }

        window.mapsInstance[i].setMapTilesLayer(new LeafletTiles(names[i]));
        window.mapsInstance[i].createMap(latlng, zoom);   
     }
 
    this.exportImageView = function() {
        var canvasExport = document.getElementById('exportView'); 
        var canvasCutter = document.getElementById('cutterView'); 
        if (canvasExport.getContext && canvasCutter.getContext){
            var ctxExp = canvasExport.getContext('2d');
            var ctxCutt = canvasCutter.getContext('2d');
        } 
        else { return }

        $.each(mapsInstance, function(i, v){

            var $mapAll = $("#map"+i);
            var $map = $("#map"+i+" .leaflet-map-pane");
            var $tiles = $(".leaflet-tile-container.leaflet-zoom-animated img");

            var delta = $map[0].style.cssText.match(/-?\d+px, -?\d+px/)[0].replace(/px/g, "").replace(" ", "").split(",");
            var tiles = [];
            var size = [$mapAll.width(), $mapAll.height()];
            delta = [-delta[0], -delta[1], -delta[0] + size[0], -delta[1] + size[1]];

            console.log(delta);

            $.each($tiles, function(t, tile){
                // var tileData = {
                //     "x1": $(tile).offset().left,
                //     "y1": $(tile).offset().top,
                //     "x2": $(tile).offset().left+$(tile).width(),
                //     "y2": $(tile).offset().top+$(tile).height(),                    
                //     "src": $(tile).attr("src")
                // };
                // var checkData = (
                //                     delta[0] < tileData.x1 < delta[2] &&
                //                     delta[1] < tileData.y1 < delta[3]
                //                 ) || 
                //                 (
                //                     delta[2] > tileData.x2 > delta[0] && 
                //                     delta[3] > tileData.y2 > delta[1]
                //                 );

                var tileData = {
                    "x1": $(tile).offset().left,
                    "y1": $(tile).offset().top,
                    "x2": $(tile).offset().left + $(tile).width(),
                    "y2": $(tile).offset().top + $(tile).height(),
                    "src": $(tile).attr("src")
                };
                console.log(tileData)
                var checkData = (delta[0] < tileData.x2 < delta[2] && delta[1] < tileData.y2 < delta[3]) || // Top-Left
                                (delta[0] < tileData.x2 < delta[2] && delta[1] < tileData.y1 < delta[3]) || // Bottom-Left
                                (delta[0] < tileData.x1 < delta[2] && delta[1] < tileData.y1 < delta[3]) || // Bottom-Right
                                (delta[0] < tileData.x1 < delta[2] && delta[1] < tileData.y2 < delta[3]) // Top-Right

                console.log(checkData);
                checkData ? tiles.push(tileData) : undefined;
            })

            console.log(delta);
            console.log($tiles);
            console.log(tiles);

            // var image = new Image();
            // image.src = "";
            // image.onload = function() {
            //     ctx.drawImage(image, 0, 0);
            // };            
        })
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

        var $container = $("#containerKartofan");

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

        topmenu.showStageMenu();
     }

    this.editMapView = function(i){

        $("#map"+i).draggable({ stop: onStop }).resizable({ stop: onStop });

        var map = mapsInstance[i];

        map.map.dragging.disable();
        // map.map.scrollWheelZoom.disable();
        // map.map.touchZoom.disable();

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
        currStage.stageMapsZoomsBlock.length = currStage.stageMapsGrid.length;

        opt.setOption("current", "stage", currStage, function(err, doc){
            if (!err){
                stage.createStage();
            }
        });

        topmenu.hideStageMenu();

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

        console.log(allStages);

        var newID = prompt(loc("editStages:inputStageID"), currStage.id);
        var newName = prompt(loc("editStages:inputStageName"), currStage.title);

        if (newID){
            if (allStages[newID] && !confirm(loc("editStages:confirmRewriteStage", newID))){
                return;
            }
            currStage.id = newID;
            currStage.title = newName;
            opt.setOption("stages", newID, currStage);  
        }
     }  

    this.setStage = function(title, stageData){
        var loadStage = opt.getOption("stages", title);
        var currStage = opt.getOption("current", "stage");
        stageData = loadStage ? loadStage : stageData ? stageData : currStage;

        $.each(stageData.stageMapsNames, function(i, v){
            if (v === "unknown" || !v){
                stageData.stageMapsNames[i] = currStage.stageMapsNames[i] ? currStage.stageMapsNames[i] : "unknown";
            }
        })

        opt.setOption("current", "stage", stageData, function(){stage.createStage()});
     }

    this.setStageMenu = function() {
        var arr = opt._createMenuArrFromBase("stages");
        $.each(arr, function(g, group){
            $.each(group, function(i, v){
                arr[g][i].callback = function(i){parent.setStage(i)};
                arr[g][i].title = opt.getOption("stages", i).title;
            })
        })
        var menu = new AccordionMenu(arr);
     }

    this.externalStageMenu = function(url) {

        url = typeof url == "string" ? url : prompt(loc("jsonImport:jsonAdd"), opt.getOption("global", "mainFeed"));

        $.getJSON(url, function(data){
            try { data = JSON.parse(Base64.decode(data.content)) }
            catch(e){}

            var arr = opt._createMenuArrFromBase("", data.stages);

            $.each(arr, function(g, group){
                $.each(group, function(i, v){
                    arr[g][i] = data.stages[i];
                    arr[g][i].callback = function(i){parent.setStage(i, arr[g][i])};
                })
            })
            var menu = new AccordionMenu(arr);
        })
     }

    this.editStage = function(stageId){

        if (!stageId){ return }

        var vals = opt.getOption("stages", stageId);
        if (!vals){ return }
        vals.id = vals.id ? vals.id : stageId;

        // Groups suggestions
        var groups = $.unique($.pluck(vals, "group"));
        groups.sort();

        var arr = [
            { "type": "formEditStage_id",        "name": "id", "val": vals.id, "loc": "editStages:formEditStage_id", "description": "id"},
            { "type": "formEditStage_title",     "name": "title", "val": vals.title, "loc": "editStages:formEditStage_title", "description": "title" },
            { "type": "formEditStage_group",     "name": "group", "val": vals.group, "options": groups, "loc": "editStages:formEditStage_group", "description": "group" },
            { "type": "formEditStage_submit", "loc": "editStages:formEditStage_submit", callback: function(form){
                if (!form.checkFormFlag){
                    alert(loc("editStages:errorCheckForm"));
                    return;
                } else {
                    stageeditor.submitStageFunc(form.data);
                    form.hideForm();
                }
            }},
            { "type": "formEditStage_delete", "loc": "editStages:formEditStage_delete", callback: function(form){
                stageeditor.deleteStageFunc(form.data, function(){eform.hideForm()});
            }},
            { "type": "formEditStage_cancel", "loc": "editStages:formEditStage_cancel", callback: function(form){
                form.hideForm();
            }},
        ];

        var eform = new FoundationForm(arr, "formEditStage");

        // eform = new EditableForm(mapvents.stageEditForm);
        // eform.fillForm(stageVals);     
     }

    this.editStageMenu = function() {
        var arr = opt._createMenuArrFromBase("stages");
        $.each(arr, function(g, group){
            $.each(group, function(i, v){
                arr[g][i].callback = function(i){parent.editStage(i)};
                arr[g][i].title = opt.getOption("stages", i).title;
            })
        })
        var menu = new AccordionMenu(arr);
     }

    this.editMapsControls = function(){
        // TODOЖ сделать в суггкте номер карты
        // var activeMap = opt.getOption("appVars", "activeMap");
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
                        mapsInstance[mapNum].removeAllControls();
                        mapsInstance[mapNum]._setMapControls();
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

    this.deleteStageFunc = function(data, callback){
        if (confirm(loc("editStages:confirmDeleteStage", data.id))) {
            if (data.id){
                opt.deleteOption("stages", data.id);
                callback();
                console.log(data.id + " deleted")
            }
        }                    
     }

    this.submitStageFunc = function(data){
        if (opt.getOption("stages", data.id)){
            if (!confirm(loc("editStages:confirmRewriteStage", data.id))) {
                return;
            }
        }

        opt.setOption("stages", data.id, data)
        console.log(data.id, opt.getOption("stages", data.id));            
     }

    this.blockActiveMapZoom = function() {
        var activeMapNum = opt.getOption("appVars", "activeMapNum");
        var currStage = opt.getOption("current", "stage");
        var currBlockZoom = currStage.stageMapsZoomsBlock[activeMapNum];
        currStage.stageMapsZoomsBlock[activeMapNum] = !!(1 - currBlockZoom);
     }  


 }}());