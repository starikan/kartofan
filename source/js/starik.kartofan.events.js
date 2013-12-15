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
    window.stageeditor = new StageEditor();
    window.mapseditor = new MapsEditor();
    window.bases = new Bases();
    window.locations = new Locations();
    window.infomenu = new InfoMenu();



    document.oncontextmenu = function(){ return false };

    // ********** ONLINE/OFFLINE EVENT **********

    if (window.navigator.onLine != undefined){
        window.addEventListener('online',  function(){
            console.log("online");
            noty({text: loc("offline:online"), type: "error"});            
        });
        window.addEventListener('offline', function(){
            console.log("offline");
            noty({text: loc("offline:offline"), type: "error"});
        });
     }

    this.contextMenuArray = [
        { type: "paragraf", text: "Map" },
        { type: "line", text: "Get External Maps", callback: function(){
            parent.mapLocalMenu.groupedCollectionMenuExteranlJSON("maps", mapseditor.setMap)
         }},

        { type: "paragraf", text: "Stage" },
        { type: "line", text: "Load External Stages", callback: function(){
            parent.stageLocalMenu.groupedCollectionMenuExteranlJSON("stages", stageeditor.loadStage)
        }},        

        { type: "paragraf", text: "Fast Moving" },
        { type: "line", text: "Go To Point", callback: function(){
            parent.pointsLocalMenu.groupedCollectionMenu(opt.getOption("points"), parent.moveToPoint, true, "group");
        }},
        { type: "line", text: "Add Point", callback: function(){
            parent.editPoint()
        }}, 
        { type: "line", text: "Edit Points", callback: function(){
            parent.pointsLocalMenu.groupedCollectionMenu(opt.getOption("points"), parent.editPoint, true, "group");
        }},         
 
        { type: "paragraf", text: "Usage" },
        { type: "line", text: "Find Locationd", callback: locations.createForm },


        { type: "paragraf", text: "Options" },
        { type: "line", text: "Set Global Settings", callback: opt.editGlobalForm },
         { type: "line", text: "Set Language", callback: function(){
            parent.langChoise();
        }},

        { type: "paragraf", text: "Help" },
        { type: "line", text: "Main Features", callback: function(){
            tourMain.start(true);
        }},        
     ];


     // ********** MAP EDITOR MENU **********

    // this.mapLocalMenu = new CSSMenu([], "mapSelectMenu", false);

    // this.stageLocalMenu = new CSSMenu([], "stageSelectMenu", false);

    // this.pointsLocalMenu = new CSSMenu([], "stageSelectMenu", false);

    this.editPointsForm = [
        { "type": "header","val": loc("editPoints:form_header") },
        { "type": "input", "val": 10000*Math.random()|0, "id": "id", "description": loc("editPoints:form_id"), "check": "^.+?" },
        { "type": "input", "id": "title", "description": loc("editPoints:form_title") },
        { "type": "input", "id": "group", "description": loc("editPoints:form_group") },
        { "type": "input", "val": opt.getOption("current", "mapCenterLatLng").join(","), "id": "latlng", "description": loc("editPoints:form_latlng"), "check": "^\\d+\\.\\d+,\\d+\\.\\d+?" },
        { "type": "button", "val": loc("editPoints:form_submit"), "id": "submit", callback: function(form)
            {
                form.getAllData(); 
                if (!form.checkForm){
                    alert(loc("editPoints:errorCheckForm"));
                    return;
                }

                if (opt.getOption("points", form.data.id)){
                    if (!confirm(loc("editPoints:confirmRewritePoint", form.data.id))) { return }
                }

                form.hideForm();

                var pointVals = opt.getOption("points", form.data.id) || {};

                $.each(form.data, function(i, v){
                    pointVals[i] = v;
                })

                pointVals.latlng = pointVals.latlng.split(",");

                opt.setOption("points", form.data.id, pointVals)
                console.log(form.data.id, opt.getOption("points", form.data.id));  
            } 
         },
        { "type": "button", "val": loc("editPoints:form_delete"), "id": "delete", callback: function(form)
            {
                form.getAllData();
                var data = form.data;
                if (opt.getOption("points", data.id)){
                    if (confirm(loc("editPoints:confirmDeletePoint", data.id))) {
                        console.log(data)
                        form.hideForm();
                        opt.deleteOption("points", data.id);
                        console.log(data.id + "deleted")
                    }
                }   
            }   
         },    
        { "type": "button", "val": loc("editPoints:form_cancel"), "id": "cancel", callback: function(form){form.hideForm()} }      
     ]
    
    this.editPoint = function(namePoint, dataPoint){
        var eform = new EditableForm(parent.editPointsForm);

        if (namePoint){
            eform.fillForm(opt.getOption("points", namePoint))
            return;
        }
        if (dataPoint){
            eform.fillForm(dataPoint)
        }
     }

    this.moveToPoint = function(namePoint, dataPoint){
        window.map0.moveAllMaps(dataPoint.latlng);
     }

    this.globalOptionsForm = [
        { "type": "header", "val": "Global Options" },
        { "type": "input", "id": "mapDefaultCenterLatLng", "description": "mapDefaultCenterLatLng", "check": "^\\d+\\.\\d+,\\d+\\.\\d+?" },
        { "type": "input", "id": "mapDefaultZoom", "description": "mapDefaultZoom", "check": "^1?\\d$|^20$" },
        { "type": "checkbox", "id": "mapSyncMoving", "description": "mapSyncMoving" },
        { "type": "checkbox", "id": "mapSyncZooming", "description": "mapSyncZooming" },
        { "type": "textarea", "id": "mapDefaultURL", "description": "mapDefaultURL", "rows": 3 },
        { "type": "checkbox", "id": "mapVizirVisible", "description": "mapVizirVisible" },
        { "type": "checkbox", "id": "mapCursorAllMapsVisible", "description": "mapCursorAllMapsVisible" },
        { "type": "checkbox", "id": "mapCache", "description": "mapCache" },
        { "type": "select", "id": "mapCacheLoad", "description": "mapCacheLoad", "options": ["internet", "cache", "internet+cache", "cache+internet"] },
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
        { "type": "select", "id": "lang", "description": "lang", "options": opt.getOption("global", "langs") },
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

    this.stageEditForm = [
        { "type": "header","val": "Stage Edit Data" },
        { "type": "input", "id": "id", "description": "id" },
        { "type": "input", "id": "title", "description": "title" },
        { "type": "tags", "id": "tags", "description": "tags" },
        { "type": "input", "id": "group", "description": "group" },
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