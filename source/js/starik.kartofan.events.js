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

    // *******************************************
    // ***************** MENUES ******************
    // *******************************************

    // ************ MAIN CONTEXT MENU ************

    this.contextMenuArray = [
        { type: "paragraf", text: "Map" },
        { type: "line", text: "Set Map", callback: function(){
            parent.mapLocalGeneratedMenu.groupedCollectionMenu(opt.getOption("maps"), mapsEditor.setMap, true, "group");
         }},
        { type: "line", text: "Edit Maps", callback: function(){
            parent.mapLocalGeneratedMenu.groupedCollectionMenu(opt.getOption("maps"), mapsEditor.editMap, true, "group");
        }},        
        { type: "line", text: "Get External Maps", callback: function(){
            parent.mapLocalGeneratedMenu.groupedCollectionMenuExteranlJSON("maps", mapsEditor.setMap)
         }},
        { type: "line", text: "Add Selected Map To Storage", callback: function(){
            mapsEditor.editMap();
        }},
        { type: "line", text: "Get All Maps From JSON", callback: function(){
            mapsEditor.getAllMapsJSON();
        }},

        { type: "paragraf", text: "Stage" },
        { type: "line", text: "Set Stage", callback: function(){
            parent.stageLocalGeneratedMenu.groupedCollectionMenu(opt.getOption("stages"), stageEditor.loadStage, true, "group");
        }},
        { type: "line", text: "Edit Stages", callback: function(){
            parent.stageLocalGeneratedMenu.groupedCollectionMenu(opt.getOption("stages"), stageEditor.editStage, true, "group");
        }},         
        { type: "line", text: "Edit Stage View", callback: function(){
            stageEditor.editView();
        }},
        { type: "line", text: "Save Stage", callback: function(){
            stageEditor.saveStage();
        }},
        { type: "line", text: "Load External Stage", callback: function(){
            parent.stageLocalGeneratedMenu.groupedCollectionMenuExteranlJSON("stages", stageEditor.loadStage)
        }},        

        { type: "paragraf", text: "Options" },
        { type: "line", text: "Set Global Settings", callback: opt.editGlobalForm },
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

    this.mainMenu = new CSSMenu(opt.getOption("html", "containerMainMenuId"), this.contextMenuArray, false);

    // TODO: touch event to context menu
    this.bindMainMenu = function(){
        $(window).unbind("contextmenu");
        $(window).bind("contextmenu", function(e){
            parent.mainMenu.showMenu();
        });
     }

    this.bindMainMenu();


    // ************ STAGES EDITOR CONTEXT MENU ************

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

    this.stageEditorMenu = new CSSMenu(opt.getOption("html", "containerStageEditorMenuId"), this.stageEditorMenuArray, false);

    // TODO: touch event to context menu
    this.bindStageEditorMenu = function(){
        $(window).unbind("contextmenu");
        $(window).bind("contextmenu", function(e){
            parent.stageEditorMenu.showMenu();
        });
     }


    // ********** MAP EDITOR MENU **********

    this.mapLocalGeneratedMenu = new CSSMenu("mapSelectMenu", [], false);


    // ********** STAGE EDITOR MENU **********

    this.stageLocalGeneratedMenu = new CSSMenu("stageSelectMenu", [], false);




    // *******************************************
    // ****************** FORMS ******************
    // *******************************************

    this.globalOptionsForm = [
        { "type": "header", "val": "Global Options" },
        { "type": "input", "id": "mapDefaultCenterLatLng", "description": "mapDefaultCenterLatLng" },
        { "type": "input", "id": "mapDefaultZoom", "description": "mapDefaultZoom", "check": "^1?\\d$|^20$" },
        { "type": "checkbox", "id": "mapSyncMoving", "description": "mapSyncMoving" },
        { "type": "checkbox", "id": "mapSyncZooming", "description": "mapSyncZooming" },
        { "type": "textarea", "id": "mapDefaultURL", "description": "mapDefaultURL", "rows": 3 },
        { "type": "checkbox", "id": "mapVizirVisible", "description": "mapVizirVisible" },
        { "type": "checkbox", "id": "mapCursorAllMapsVisible", "description": "mapCursorAllMapsVisible" },
        { "type": "checkbox", "id": "gpsAutoStart", "description": "gpsAutoStart" },
        { "type": "checkbox", "id": "gpsMarker", "description": "gpsMarker" },
        { "type": "checkbox", "id": "gpsAccuracy", "description": "gpsAccuracy" },
        { "type": "checkbox", "id": "gpsFollowing", "description": "gpsFollowing" },
        { "type": "checkbox", "id": "hashChange", "description": "hashChange" },
        { "type": "checkbox", "id": "resetToDefaultIfHashClear", "description": "resetToDefaultIfHashClear" },
        { "type": "input", "id": "dbPointsStorySave", "description": "dbPointsStorySave", "check": "^\\d+$" },
        { "type": "checkbox", "id": "dbSyncIn", "description": "dbSyncIn" },
        { "type": "checkbox", "id": "dbSyncOut", "description": "dbSyncOut" },
        { "type": "input", "id": "dbExtServerIn", "description": "dbExtServerIn" },
        { "type": "textarea", "id": "dbExtServerOut", "description": "dbExtServerOut", "rows": 4 },
        { "type": "input", "id": "stageViewConstructorElasticSizeErrorPersent", "description": "stageViewConstructorElasticSizeErrorPersent", "check": "^1?\\d$" },
        { "type": "select", "id": "lang", "description": "lang", "options": ["en_US", "ru_RU"] },
        { 
            "type": "button", 
            "val": "Update", 
            "id": "submit",
            "callback": function(form){
                form.getAllData();
                var data = form.data;
                if (form.checkForm){
                    
                    form.hideForm();

                    data.mapDefaultCenterLatLng = data.mapDefaultCenterLatLng.split(",");
                    data.dbExtServerOut = data.dbExtServerOut.split(",");
                    data.mapDefaultZoom = data.mapDefaultZoom|0;
                    data.stageViewConstructorElasticSizeErrorPersent = data.stageViewConstructorElasticSizeErrorPersent|0;
                    data.dbPointsStorySave = data.dbPointsStorySave|0;

                    console.log(data);

                    $.each(data, function(i, v){
                        opt.setOption("global", i, v);
                    })
                }
            }
        },
        { 
            "type": "button", 
            "val": "Cancel", 
            "id": "cancel",
            "callback": function(form){form.hideForm()}
        }  
     ]

    this.mapEditForm = [
        { "type": "header","val": "Active Map Add" },
        { "type": "input", "id": "id", "description": "id"},
        { "type": "input", "id": "title", "description": "title" },
        { "type": "select", "val": "img", "options": ["img", "wms"], "id": "server", "description": "server" },
        { "type": "input", "id": "layer", "description": "layer" },
        { "type": "tags", "id": "tags", "description": "tags" },
        { "type": "datalist", "id": "group", "placeholder": "", "description": "group" },
        { "type": "select", "id": "src", "options": ["Internet", "Storage", "Local"], "description": "src"},
        { "type": "select", "id": "crs", "options": ["", "EPSG3857", "EPSG3857.Ext", "EPSG3395", "Simple"], "description": "CRS" },    
        { "type": "textarea", "id": "tilesURL", "rows": 3, "description": "tilesURL" },
        { "type": "input", "id": "maxZoom", "placeholder": "", "description": "maxZoom", "check": "^1?\\d$|^20$" },
        { "type": "input", "id": "minZoom", "placeholder": "", "description": "minZoom","check": "^1?\\d$|^20$" },
        { "type": "input", "id": "startZoom", "placeholder": "", "description": "startZoom", "check": "^1?\\d$|^20$" },
        { "type": "button", "val": "Add Map", "id": "submit", callback: function(form){mapsEditor._submitMapFunc(form)}  },
        { "type": "button", "val": "Delete Map", "id": "delete", callback: function(form){mapsEditor._deleteMapFunc(form)}  },    
        { "type": "button", "val": "Cancel", "id": "cancel", callback: function(form){form.hideForm()} },
     ];

    this.stageEditForm = [
        { "type": "header","val": "Stage Edit Data" },
        { "type": "input","val": "", "id": "id", "description": "id" },
        { "type": "input","val": "", "id": "title", "description": "title" },
        { "type": "tags","val": "", "id": "tags", "description": "tags" },
        { "type": "input","val": "", "id": "group", "description": "group" },
        { "type": "button", "val": "Add Stage", "id": "submit", callback: function(form)
            {
                form.getAllData(); 
                if (!form.checkForm){
                    alert(loc("editStage:errorCheckForm"));
                    return;
                }

                if (opt.getOption("stages", form.data.id)){
                    if (!confirm(loc("editStage:stageRewriteConfirm", form.data.id))) { return }
                }

                form.hideForm();

                stageVals = opt.getOption("stages", form.data.id);
                if (!stageVals){ return }

                $.each(form.data, function(i, v){
                    stageVals[i] = v;
                })

                opt.setOption("stages", form.data.id, stageVals)
                console.log(form.data.id, opt.getOption("stages", form.data.id));  
            } 
         },
        { "type": "button", "val": "Delete Stage", "id": "delete", callback: function(form)
            {
                form.getAllData();
                var data = form.data;
                if (confirm(loc("editStage:deleteStage", data.id))) {
                    console.log(data)
                    if (opt.getOption("stages", data.id)){
                        form.hideForm();
                        opt.deleteOption("stages", data.id);
                        console.log(data.id + "deleted")
                    }
                }   
            }   
         },    
        { "type": "button", "val": "Cancel", "id": "cancel", callback: function(form){form.hideForm()} } 
     ];

 }}());