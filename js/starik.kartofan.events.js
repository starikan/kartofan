"use strict"

var Events = function(){

    var parent = this;

    if (typeof opt === "undefined" || !(opt instanceof Options)) { 
        window.opt = new Options();
        opt = window.opt;
     }

    // ********** WINDOW RESIZE **********
    this.eventResizeWindow = function(e){
        for (var i=0; i<LeafletMap.prototype.instances.length; i++){
            LeafletMap.prototype.instances[i].refreshMapAfterResize();
        }            
     }
    window.onresize = this.eventResizeWindow;



    // ***** MAIN CONTEXT MENU AND FORMS *****

    this.contextMenuArray = [
        { type: "paragraf", text: "Map" },

        { type: "line", text: "Set Map", callback: function(){
            parent.closeContextMenu();
            parent.createLocaleSelectMenu("maps", parent.setActiveMap);
         }},
        { type: "line", text: "Edit Maps", callback: function(){
            parent.closeContextMenu();
            parent.createLocaleSelectMenu("maps", parent.editMap, "Select To Edit Map Data");
        }},        
        { type: "line", text: "Get External Maps", callback: function(){
            parent.closeContextMenu();
            parent.createExternalJSONMenu("maps", function(i, v){
                                                      parent.closeAllModal();
                                                      parent.setActiveMap(i, v);
                                                  })
         }},
        { type: "line", text: "Add Selected Map To Storage", callback: function(){
            parent.closeContextMenu();
            parent.editMap();
        }},
        { type: "line", text: "Get All Maps From JSON", callback: function(){
            parent.closeContextMenu();
            parent.getAllMapsJSON();
        }},

        { type: "paragraf", text: "Stage" },
        { type: "line", text: "Load Stage", callback: function(){
            parent.closeContextMenu();
            parent.createLocaleSelectMenu("stages", function(i, v){
                                                        parent.closeAllModal();
                                                        parent.loadStage(i);
                                                    });
        }},
        { type: "line", text: "Edit Stage View", callback: function(){
            parent.closeContextMenu();
            parent.editView();
        }},
        { type: "line", text: "Save Stage", callback: function(){
            parent.closeContextMenu();
            parent.saveStage();
        }},
        { type: "line", text: "Load External Stage", callback: function(){
            parent.closeContextMenu();
            parent.createExternalJSONMenu("stages", function(i, v){
                                                      parent.closeAllModal();
                                                      parent.loadStage("", v);
                                                  })
        }},        

        { type: "paragraf", text: "Options" },
        { type: "line", text: "Global Settings" },
        { type: "line", text: "Global Maps View" },
        { type: "line", text: "Settings Reset", callback: function(){
            parent.closeContextMenu();
            opt._clearAllBases();
        }},
        { type: "line", text: "Update from External Storage", callback: function(){
            parent.closeContextMenu();
            opt.syncIn();
        }},
        { type: "line", text: "Export All Data In JSON", callback: function(){
            parent.closeContextMenu();
            opt.exportAllInJSON();
        }},        
     ];

    this.closeContextMenu = function(id){
        if (!id){
            $(".cssmenu_container").addClass("hide");
        }
        else {
            $(".cssmenu_container#"+id).addClass("hide");
        }
     }

    this.closeAllForms = function(){
        $(".cssform").addClass("hide");
     }

    this.closeAllModal = function(){
        parent.closeContextMenu();
        parent.closeAllForms();
     }

    // TODO: touch event to context menu
    this.onMainContextMenu = function(arr){
        document.oncontextmenu = function(){ return false };
        $("#"+opt.getOption("html", "containerAllMapsId")).bind("mousedown click", this.closeAllModal);
        $(window).bind("contextmenu", function(e){
            var menu = new CSSMenu(opt.getOption("html", "containerMainMenuId"), arr, true);
        });
     }

    this.onMainContextMenu(parent.contextMenuArray);


    // ********** SET MAP **********
    this.setActiveMap = function(mapName, mapData){
        mapName = mapName ? mapName : "";
        var mapNum = opt.getOption("current", "activeMap");
        window[mapNum].setMapTilesLayer(new LeafletTiles(mapName, mapData));
     }

    this.createLocaleSelectMenu = function(collection, callback, header){

        var allData = opt.getOption(collection);

        var groups = _.pluck(allData, 'group');
        groups = _.unique(groups);
        groups.sort();

        var genArray = [{ type: "header", text: header }];

        $.each(groups, function(g, group){

            var dataInGroup = {};
            $.each(allData, function(i, v){
                if (!v.group && !group){
                    dataInGroup[i] = v;
                }
                if (v.group == group) {
                    dataInGroup[i] = v;
                }
            })

            if (!$.isEmptyObject(dataInGroup)){
                
                if (!group) {group = "Others"};
                genArray.push({ type: "paragraf", text: group });
                
                $.each(dataInGroup, function(i, vi){
                    genArray.push({
                        type: "line", 
                        text: vi.title ? vi.title : "Noname",
                        callback: function(){
                            callback(i);
                        },
                    })
                });
            }
        })

        new CSSMenu("mapSelectMenu", genArray, true);
     }

    this.createExternalJSONMenu = function(collection, callback, header){

        var extData = opt.getOption("global", "externalFeeds");

        var menuObj = [{ type: "header", text: header }]; 

        var menu = new CSSMenu("mapSelectMenu", menuObj, true);

        $.each(extData, function(i, extJSON){
            $.get(extJSON.url, function(data){

                var genArr = [ { type: "paragraf", text: extJSON.title } ];
                
                $.each(data[collection], function(j, data){
                    genArr.push({
                        type: "line", 
                        text: data.title ? data.title : "Noname",
                        callback: function(){ callback(j, data) },
                    });
                });
                menu.makeFromObj(genArr);
            })
        });
     }

    this.editMap = function(mapId){

        var maps = opt.getOption("maps");
        var mapVals;

        var _deleteMapFunc = function(form){
            if (confirm("Do you realy want to delete " + mapVals.id + " map?")) {
                if (mapVals.id){
                    form.hideForm();
                    opt.deleteOption("maps", mapVals.id);
                    console.log(mapVals.id + "deleted")
                }
            }                    
         }

        var _submitMapFunc = function(form){
            form.getAllData(); 
            if (!form.checkForm){
                // TODO: локализация
                alert("Errors in form! Check values.");
                return;
            }

            if (opt.getOption("maps", form.allData.val.id)){
                // TODO: локализация
                if (!confirm("Такая карта уже есть. Перезаписать.")) {
                    return;
                }
            }

            form.hideForm();
            opt.setOption("maps", form.allData.val.id, form.allData.val)
            console.log(form.allData.val.id, opt.getOption("maps", form.allData.val.id));            
         }

        var eformFunc = {
            "submit": { "events": "click", callback: _submitMapFunc },
            "delete": { "events": "click", callback: function(form){_deleteMapFunc(form)} },
            "cancel": { "events": "click", callback: function(form){form.hideForm()} }
         }


        // If no mapId get active map
        if (!mapId){
            var mapNum = opt.getOption("current", "activeMap");
            mapVals = window[mapNum].mapTilesLayer.mapData;
            console.log(mapVals)
            mapVals.id = window[mapNum].mapTilesLayer.mapName;
        }
        else {
            mapVals = opt.getOption("maps", mapId);
            mapVals.id = mapVals.id ? mapVals.id : mapId;
        }

        // Groups suggestions
        var mapOptions = {}
        var tempGroups = []
        $.each(maps, function(i, v){
            if (v.group){
                tempGroups.push(v.group)
            }
        })
        tempGroups = _.uniq(tempGroups);
        tempGroups.sort()
        mapOptions.group = tempGroups;        

        // Generate Form
        $.getJSON("json/map_edit_form.json", function(eformFields){
            eform = new EditableForm("addMap", eformFields, eformFunc);
            eform.fillForm(mapVals, mapOptions);
            
            console.log(eform.allData);
        }); 
     }

    this.getAllMapsJSON = function(url){
        if (!url){
            // TODO: локализация
            url = prompt("Type here JSON with maps URL");
        }

        $.getJSON(url, function(data){
            $.each(data.maps, function(i,v){
                if (opt.getOption("maps", i)){
                    // TODO: локализация
                    if (!confirm(i+" - Такая карта уже есть. Перезаписать.")) {
                        return;
                    }
                }
                opt.setOption("maps", i, v);
            })
        }); 

     }


    // ************ STAGES ************

    this.editStageContextMenuArray = [
 
        { type: "paragraf", text: "Stage", active: true },
        { type: "line", text: "Save Stage View", callback: function(){
            parent.closeContextMenu();
            parent.saveView();
        }},
        { type: "line", text: "Add Map", callback: function(){
            parent.closeContextMenu();
            parent.addMapToStage();
        }},
        { type: "line", text: "Remove Map", callback: function(){
            parent.closeContextMenu();
            parent.removeMapFromStage();
        }},
     ];

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

    this.editView = function(){
        $.each(opt.getOption("current", "stage").stageMapsGrid, function(i, v){
            parent.editMapView(i)
        });
    
        parent.onMainContextMenu(parent.editStageContextMenuArray);
     }

    this.editMapView = function(i){

        var onStop = function(){
            
            var $this = $(this);

            var pos = _getPersentPosition(this);

            $this.width(pos.width + "%").height(pos.height + "%")
            .css("top", pos.top + "%").css("left", pos.left + "%");

        }

        $("#map"+i).draggable({ stop: onStop }).resizable({ stop: onStop });

        var map = window["map"+i];

        map.map.dragging.disable();
        map.map.scrollWheelZoom.disable();
        map.map.touchZoom.disable();

        if (map.zoomControl) {map.map.removeControl(map.zoomControl)};
        if (map.scaleControl) {map.map.removeControl(map.scaleControl)};
        if (map.copyrightControl) {map.map.removeControl(map.copyrightControl)};
        if (map.zoomLevelControl) {map.map.removeControl(map.zoomLevelControl)};
        
        if (!map.nameControl) {map.nameControl = L.control.attribution({position: "bottomright" })}
        map.nameControl.setPrefix("map"+i);

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

        opt.setOption("current", "stage", currStage, function(err, doc){
            if (!err){
                stage.createStage();
            }
        });

        parent.onMainContextMenu(parent.contextMenuArray);

     }

    this.addMapToStage = function(){

        var mapsCount = $(".maps").length;

        stage.addMapDiv(mapsCount, [25, 25, 50, 50]);
        stage.addMapObject(mapsCount);

        parent.editMapView(mapsCount);

     }

    this.removeMapFromStage = function(){
        var mapNum = opt.getOption("current", "activeMap");
        var mapsCount = $(".maps").length;

        if (mapsCount>1){
            $("#"+mapNum).remove();
        }
     }  
        
    this.saveStage = function(){
        var allStages = opt.getOption("stages");
        var currStage = opt.getOption("current", "stage");

        console.log(allStages)

        // TODO локализация
        var newName = prompt("Input Stage ID", currStage.title)
        if (newName){
            // TODO локализация
            if (allStages[newName] && !confirm("This ID already exist. Rewrite it?")){
                return;
            }
            currStage.title = newName;
            opt.setOption("stages", newName, currStage);  
        }
     }  

    this.loadStage = function(title, stageData){
        stageData = title ? opt.getOption("stages", title) : stageData ? stageData : opt.getOption("current", "stage");
        opt.setOption("current", "stage", stageData);
        stage.createStage();
     }     
 }