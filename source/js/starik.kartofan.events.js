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
        { type: "line", text: "Set Stage", callback: function(){
            parent.closeContextMenu();
            parent.createLocaleSelectMenu("stages", function(i, v){
                                                        parent.closeAllModal();
                                                        parent.loadStage(i);
                                                    });
        }},
        { type: "line", text: "Edit Stages", callback: function(){
            parent.closeContextMenu();
            parent.createLocaleSelectMenu("stages", parent.editStage, "Select To Edit Stage Data");
        }},         
        { type: "line", text: "Edit Stage View", callback: function(){
            parent.closeContextMenu();
            stageEditor.editView();
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

        { type: "paragraf", text: "GPS" },
        { type: "line", text: "Start Location", callback: function(){
            parent.closeContextMenu();
            gps.startGPS();
        }},
        { type: "line", text: "Stop Location", callback: function(){
            parent.closeContextMenu();
            gps.stopGPS();
        }},

        { type: "paragraf", text: "Help" },
        { type: "line", text: "Main Features", callback: function(){
            parent.closeContextMenu();
            tourMain.start(true);
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

        parent.closeContextMenu();

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

    this.getAllMapsJSON = function(url){
        if (!url){
            url = prompt(loc("editMaps:mapsJSONAdd"));
        }

        $.getJSON(url, function(data){
            $.each(data.maps, function(i,v){
                if (opt.getOption("maps", i)){
                    if (!confirm(loc("editMaps:mapRewriteConfirm"))) {
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
            stageEditor.saveView();
        }},
        { type: "line", text: "Add Map", callback: function(){
            parent.closeContextMenu();
            stageEditor.addMapToStage();
        }},
        { type: "line", text: "Remove Map", callback: function(){
            parent.closeContextMenu();
            stageEditor.removeMapFromStage();
        }},
        { type: "line", text: "Edit Controls", callback: function(){
            parent.closeContextMenu();
            stageEditor.editMapsControls();
        }},        
     ];

 }}());