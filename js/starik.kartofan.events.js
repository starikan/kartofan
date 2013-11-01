"use strict"


var Events = function(){

    var parent = this;

    if (typeof opt === "undefined" || !(opt instanceof Options)) { 
        window.opt = new Options();
        opt = window.opt;
     }

    if (typeof eform === "undefined" || !(eform instanceof EditableForm)){
        window.eform = new EditableForm();
        eform = window.eform;
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
            parent.setActiveMapForm();
        }},
        { type: "line", text: "Set Map View" },
        { type: "paragraf", text: "Stage" },
        { type: "line", text: "Load Stage" },
        { type: "line", text: "Save Stage" },
        { type: "paragraf", text: "Options" },
        { type: "line", text: "Global Settings" },
        { type: "line", text: "Global Maps View" },
        { type: "line", text: "Settings Reset" },
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

    // TODO: it`s bad realization. Need more independance from class name
    this.closeAllForms = function(){
        $(".form-flat").addClass("hide");
     }

    this.closeAllModal = function(){
        parent.closeContextMenu();
        parent.closeAllForms();
     }

    // TODO: touch event to context menu
    document.oncontextmenu = function(){ return false };
    $("#"+opt.getOption("html", "containerAllMapsId")).bind("click", this.closeAllModal);
    window.oncontextmenu = this.openContextMenu;


    // FORMS IN MAINMENU
    // this.formJSON = {
    //     header: "Заголовок",
    //     inputs: [
    //         {type: "input", val: "", placeholder: "text", description: "description"},
    //         {type: "input", val: "", placeholder: "text", description: "description"},
    //         {type: "input", val: "", placeholder: "text", description: "description"},
    //         {type: "input", val: "", placeholder: "text", description: "description"},
    //         {type: "select", val: ["123", "321"], placeholder: "text", description: "description"},
    //         {type: "select2", val: ["123", "321"], placeholder: "text", description: "description"},
    //         {type: "send", val: "send", id: "sendForm", extclass: "sendForm"},
    //         {type: "cancel", val: "cancel", id: "cancelForm", extclass: "cancelForm"},            
    //     ],
    //  }    

    // this.contextMenuGlobalOptions = function(){
    //     parent.closeContextMenu();

    //     eform.clearForm();
    //     eform.makeFromJSON(JSON.stringify(parent.formJSON));
    //     eform.showForm();
    //  }
    // // TODO: touch event
    // $("#optionsGlobal").bind("click", this.contextMenuGlobalOptions);


    // ********** SET MAP **********
    this.setActiveMap = function(mapName){
        mapName = mapName ? mapName : "";
        var mapNum = opt.getOption("current", "activeMap");
        window[mapNum].setMapTilesLayer(new LeafletTiles(mapName));
     }

    this.setActiveMapForm = function(){
        var maps = opt.getOption("maps");

        var genArray = [
            { type: "header", text: "Select map" },
            { type: "paragraf", text: "Select map", active: true },
        ];

        $.each(maps, function(i, v){
            genArray.push({
                type: "line", 
                text: i,
                callback: function(){
                    parent.closeAllModal();
                    parent.setActiveMap(i);
                },
            })
        })

        var menu = new CSSMenu("mapSelectMenu", genArray, true);
     }
}