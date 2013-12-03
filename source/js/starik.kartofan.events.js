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


 }}());