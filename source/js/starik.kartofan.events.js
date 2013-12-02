"use strict"

var Events = (function(){

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
    window.gps = new GPS();
    window.stageEditor = new StageEditor();
    window.mapsEditor = new MapsEditor();
    window.bases = new Bases();


    // ********** WINDOW RESIZE EVENT **********

    this.eventResizeWindow = function(e){
        for (var i=0; i<LeafletMap.prototype.instances.length; i++){
            LeafletMap.prototype.instances[i].refreshMapAfterResize();
        }            
     }

    window.onresize = this.eventResizeWindow;



    // ********** CONTEXT MENU EVENT **********

    this.closeContextMenu = function(id){
        id ? $(".cssmenu_container#"+id).addClass("hide") : $(".cssmenu_container").addClass("hide");
     }

    this.closeAllForms = function(){
        $(".eform").addClass("hide");
     }

    // TODO: touch event to context menu
    $("#"+opt.getOption("html", "containerAllMapsId")).bind("mousedown click", function(){
        parent.closeContextMenu();
        parent.closeAllForms();
     });

    document.oncontextmenu = function(){ return false };


    // ************ MAIN CONTEXT MENU ************

    this.mainMenu;

    this.contextMenuArray = [
        { type: "paragraf", text: "Map" },
        { type: "line", text: "Set Map", callback: function(){
            parent.createLocaleSelectMenu("maps", parent.setActiveMap);
         }},
        { type: "line", text: "Edit Maps", callback: function(){
            parent.createLocaleSelectMenu("maps", parent.editMap, "Select To Edit Map Data");
        }},        
        { type: "line", text: "Get External Maps", callback: function(){
            parent.createExternalJSONMenu("maps", function(i, v){ parent.setActiveMap(i, v) })
         }},
        { type: "line", text: "Add Selected Map To Storage", callback: function(){
            parent.editMap();
        }},
        { type: "line", text: "Get All Maps From JSON", callback: function(){
            mapsEditor.getAllMapsJSON();
        }},

        { type: "paragraf", text: "Stage" },
        { type: "line", text: "Set Stage", callback: function(){
            parent.createLocaleSelectMenu("stages", function(i, v){ parent.loadStage(i) });
        }},
        { type: "line", text: "Edit Stages", callback: function(){
            parent.createLocaleSelectMenu("stages", parent.editStage, "Select To Edit Stage Data");
        }},         
        { type: "line", text: "Edit Stage View", callback: function(){
            stageEditor.editView();
        }},
        { type: "line", text: "Save Stage", callback: function(){
            parent.saveStage();
        }},
        { type: "line", text: "Load External Stage", callback: function(){
            parent.createExternalJSONMenu("stages", function(i, v){ parent.loadStage("", v) })
        }},        

        { type: "paragraf", text: "Options" },
        { type: "line", text: "Global Settings" },
        { type: "line", text: "Global Maps View" },
        { type: "line", text: "Settings Reset", callback: function(){
            bases._clearAllBases();
        }},
        { type: "line", text: "Update from External Storage", callback: function(){
            bases.syncIn();
        }},
        { type: "line", text: "Export All Data In JSON", callback: function(){
            opt.exportAllInJSON();
        }},

        { type: "paragraf", text: "GPS" },
        { type: "line", text: "Start Location", callback: function(){
            gps.startGPS();
        }},
        { type: "line", text: "Stop Location", callback: function(){
            gps.stopGPS();
        }},

        { type: "paragraf", text: "Help" },
        { type: "line", text: "Main Features", callback: function(){
            tourMain.start(true);
        }},        
     ];

    this._initMainMenu = function(){
        this.mainMenu = new CSSMenu(opt.getOption("html", "containerMainMenuId"), this.contextMenuArray, false);
        this.bindMainMenu();
     }

    // TODO: touch event to context menu
    this.bindMainMenu = function(){
        $(window).unbind("contextmenu");
        $(window).bind("contextmenu", function(e){
            parent.mainMenu.showMenu();
        });
     }

    this._initMainMenu();


    // ************ STAGES CONTEXT MENU ************

    this.stageEditorMenu;

    this.stageEditorMenuArray = [
 
        { type: "paragraf", text: "Stage", active: true },
        { type: "line", text: "Save Stage View", callback: function(){
            stageEditor.saveView();
        }},
        { type: "line", text: "Add Map", callback: function(){
            stageEditor.addMapToStage();
        }},
        { type: "line", text: "Remove Map", callback: function(){
            stageEditor.removeMapFromStage();
        }},
        { type: "line", text: "Edit Controls", callback: function(){
            stageEditor.editMapsControls();
        }},        
     ];

    this._initStageEditorMenu = function(){
        this.stageEditorMenu = new CSSMenu(opt.getOption("html", "containerStageEditorMenuId"), this.stageEditorMenuArray, false);
     }

    // TODO: touch event to context menu
    this.bindStageEditorMenu = function(){
        $(window).unbind("contextmenu");
        $(window).bind("contextmenu", function(e){
            parent.stageEditorMenu.showMenu();
        });
     }

    this._initStageEditorMenu(); 


    // ********** SET MAP **********
    this.setActiveMap = function(mapName, mapData){
        mapName = mapName ? mapName : "";
        var mapNum = opt.getOption("current", "activeMap");
        window[mapNum].setMapTilesLayer(new LeafletTiles(mapName, mapData));
     }

    this.createLocaleSelectMenu = function(collection, callback, header){

        var allData = opt.getOption(collection);

        var groups = $.pluck(allData, 'group');
        groups = $.unique(groups);
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

            extJSON.type = extJSON.type ? extJSON.type : "local";
            extJSON.url = extJSON.type == "GitHub" ? extJSON.url + "?callback" : extJSON.url;

            $.getJSON(extJSON.url, function(data){
                var genArr = [ { type: "paragraf", text: extJSON.title } ];

                if (extJSON.type == "GitHub"){
                    data = JSON.parse(Base64.decode(data.content));
                }

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
            if (confirm(loc("editMaps:deleteMap", mapVals.id))) {
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
                alert(loc("editMaps:errorCheckForm"));
                return;
            }

            if (opt.getOption("maps", form.allData.val.id)){
                if (!confirm(loc("editMaps:mapRewriteConfirm", form.allData.val.id))) {
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
        tempGroups = $.unique(tempGroups);
        tempGroups.sort()
        mapOptions.group = tempGroups;        

        // Generate Form
        $.getJSON("data/map_edit_form.json", function(eformFields){
            eform = new EditableForm("addMap", eformFields, eformFunc);
            eform.fillForm(mapVals, mapOptions);
            
            console.log(eform.allData);
        }); 
     }

 }}());