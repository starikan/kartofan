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
            parent.createLocaleMapsForm();
         }},
        { type: "line", text: "Get External Maps", callback: function(){
            parent.closeContextMenu();
            parent.createExternalMapsForm();
         }},
        { type: "line", text: "Add Selected Map To Storage", callback: function(){
            parent.closeContextMenu();
            parent.addMapToStorage();
        } },
        { type: "line", text: "Edit Map Data" },
        { type: "paragraf", text: "Stage" },
        { type: "line", text: "Load Stage" },
        { type: "line", text: "Save Stage" },
        { type: "paragraf", text: "Options" },
        { type: "line", text: "Global Settings" },
        { type: "line", text: "Global Maps View" },
        { type: "line", text: "Settings Reset" },
        { type: "line", text: "Update from External Storage", callback: function(){
            parent.closeContextMenu();
            opt.syncIn();
        }},
     ];

    this.openContextMenu = function(e){
        var menu = new CSSMenu(opt.getOption("html", "containerMainMenuId"), parent.contextMenuArray, true);
     }    

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
    document.oncontextmenu = function(){ return false };
    $("#"+opt.getOption("html", "containerAllMapsId")).bind("mousedown click", this.closeAllModal);
    window.oncontextmenu = this.openContextMenu;



    // ********** SET MAP **********
    this.setActiveMap = function(mapName, mapData){
        mapName = mapName ? mapName : "";
        var mapNum = opt.getOption("current", "activeMap");
        window[mapNum].setMapTilesLayer(new LeafletTiles(mapName, mapData));
     }

    this.createLocaleMapsForm = function(header){

        var maps = opt.getOption("maps");

        var groups = _.pluck(maps, 'group');
        groups.sort();

        var genArray = [
            { type: "header", text: header },
        ];

        $.each(groups, function(g, vg){

            var mapsInGroup = {};
            $.each(maps, function(i, v){
                if (!v.group && !vg){
                    mapsInGroup[i] = v;
                }
                if (v.group == vg) {
                    mapsInGroup[i] = v;
                }
            })

            if (!$.isEmptyObject(mapsInGroup)){
                
                if (!vg) {vg = "Others"};
                genArray.push({ type: "paragraf", text: vg });
                
                $.each(mapsInGroup, function(i, vi){
                    genArray.push({
                        type: "line", 
                        text: vi.title ? vi.title : "Noname Map",
                        callback: function(){
                            parent.closeAllModal();
                            parent.setActiveMap(i);
                        },
                    })
                });
            }
        })

        new CSSMenu("mapSelectMenu", genArray, true);
     }

    this.createExternalMapsForm = function(header){

        var extMaps = opt.getOption("global", "mapExternalFeeds");

        var menuObj = [
            { type: "header", text: header },
        ]; 

        var menu = new CSSMenu("mapSelectMenu", menuObj, true);

        $.each(extMaps, function(i, vi){
            $.get(vi, function(data){
                var genArr = [
                    { type: "paragraf", text: vi },
                ];
                $.each(data, function(j, vj){
                    genArr.push({
                        type: "line", 
                        text: vj.title ? vj.title : "Noname Map",
                        callback: function(){
                            parent.closeAllModal();
                            parent.setActiveMap(j, vj);
                        },                            
                    });
                });
                menu.makeFromObj(genArr);
            })
        });
     }

    this.addMapToStorage = function(mapId){

        var maps = opt.getOption("maps");
        var mapData;

        // If no mapId get active map
        if (!mapId){
            var mapNum = opt.getOption("current", "activeMap");
            mapData = window[mapNum].mapTilesLayer.mapData;
            mapData.id = window[mapNum].mapTilesLayer.mapName;
        }
        else {
            mapData = opt.getOption("maps", mapId);
            mapData.id = mapData.id ? mapData.id : mapId;
        }

        var submitFunc = function(form){
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
            "submit": {
                "events": "click",
                "callback": submitFunc,
            },
            "cancel": {
                "events": "click",
                "callback": function(form){form.hideForm();}                
            }
         }
        
        $.getJSON("json/active_map_add_form.json", function(eformFields){
            console.log(eformFields)
            eform = new EditableForm("addMap", eformFields, eformFunc);
            eform.fillForm(mapData);
            console.log(eform.allData);
         });

     }

 }