"use strict"

    // this.contextMenuArray = [

    //     { type: "paragraf", text: "Options" },
    //     { type: "line", text: "Set Global Settings", callback: opt.editGlobalForm },

    //     { type: "paragraf", text: "Help" },
    //     { type: "line", text: "Main Features", callback: function(){
    //         tourMain.start(true);
    //     }},        
    //  ];

    // this.globalOptionsForm = [
    //     { "type": "header", "val": "Global Options" },
    //     { "type": "input", "id": "mapDefaultCenterLatLng", "description": "mapDefaultCenterLatLng", "check": "^\\d+\\.\\d+,\\d+\\.\\d+?" },
    //     { "type": "input", "id": "mapDefaultZoom", "description": "mapDefaultZoom", "check": "^1?\\d$|^20$" },
    //     { "type": "checkbox", "id": "mapSyncMoving", "description": "mapSyncMoving" },
    //     { "type": "checkbox", "id": "mapSyncZooming", "description": "mapSyncZooming" },
    //     { "type": "textarea", "id": "mapDefaultURL", "description": "mapDefaultURL", "rows": 3 },
    //     { "type": "checkbox", "id": "mapVizirVisible", "description": "mapVizirVisible" },
    //     { "type": "checkbox", "id": "mapCursorAllMapsVisible", "description": "mapCursorAllMapsVisible" },
    //     { "type": "checkbox", "id": "mapCache", "description": "mapCache" },
    //     { "type": "select", "id": "mapCacheLoad", "description": "mapCacheLoad", "options": ["internet", "cache", "internet+cache", "cache+internet"] },
    //     { "type": "checkbox", "id": "gpsAutoStart", "description": "gpsAutoStart" },
    //     { "type": "checkbox", "id": "gpsMarker", "description": "gpsMarker" },
    //     { "type": "checkbox", "id": "gpsAccuracy", "description": "gpsAccuracy" },
    //     { "type": "checkbox", "id": "gpsFollowing", "description": "gpsFollowing" },
    //     { "type": "checkbox", "id": "hashChange", "description": "hashChange" },
    //     { "type": "checkbox", "id": "resetToDefaultIfHashClear", "description": "resetToDefaultIfHashClear" },
    //     { "type": "input", "id": "dbPointsStorySave", "description": "dbPointsStorySave", "check": "^\\d+$" },
    //     { "type": "checkbox", "id": "dbSyncIn", "description": "dbSyncIn" },
    //     { "type": "checkbox", "id": "dbSyncOut", "description": "dbSyncOut" },
    //     { "type": "input", "id": "dbExtServerIn", "description": "dbExtServerIn" },
    //     { "type": "textarea", "id": "dbExtServerOut", "description": "dbExtServerOut", "rows": 4 },
    //     { "type": "input", "id": "stageViewConstructorElasticSizeErrorPersent", "description": "stageViewConstructorElasticSizeErrorPersent", "check": "^1?\\d$" },
    //     { "type": "select", "id": "lang", "description": "lang", "options": opt.getOption("global", "langs") },
    //     { 
    //         "type": "button", 
    //         "val": "Update", 
    //         "id": "submit",
    //         "callback": function(form){
    //             form.getAllData();
    //             var data = form.data;
    //             if (form.checkForm){
                    
    //                 form.hideForm();

    //                 data.mapDefaultCenterLatLng = data.mapDefaultCenterLatLng.split(",");
    //                 data.dbExtServerOut = data.dbExtServerOut.split(",");
    //                 data.mapDefaultZoom = data.mapDefaultZoom|0;
    //                 data.stageViewConstructorElasticSizeErrorPersent = data.stageViewConstructorElasticSizeErrorPersent|0;
    //                 data.dbPointsStorySave = data.dbPointsStorySave|0;

    //                 console.log(data);

    //                 $.each(data, function(i, v){
    //                     opt.setOption("global", i, v);
    //                 })
    //             }
    //         }
    //      },
    //     { 
    //         "type": "button", 
    //         "val": "Cancel", 
    //         "id": "cancel",
    //         "callback": function(form){form.hideForm()}
    //      }  
    //  ]