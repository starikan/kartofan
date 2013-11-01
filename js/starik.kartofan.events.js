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

    this.$mainmenu = $("#"+opt.getOption("html", "containerMainMenuId"));
    this.$allMapsContainer = $("#"+opt.getOption("html", "containerAllMapsId"));

    this.initMainEvents = function(){

     }



    // ********** WINDOW RESIZE **********
    this.eventResizeWindow = function(e){
        for (var i=0; i<LeafletMap.prototype.instances.length; i++){
            LeafletMap.prototype.instances[i].refreshMapAfterResize();
        }            
     }
    window.onresize = this.eventResizeWindow;



    // ***** MAIN CONTEXT MENU AND FORMS *****
    document.oncontextmenu = function(){ return false };

    this.openContextMenu = function(e){
        parent.$mainmenu.removeClass("hide");
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

    window.oncontextmenu = this.openContextMenu;

    this.closeAllModal = function(){
        parent.closeContextMenu();
        parent.closeAllForms();
     }

    // TODO: touch event to context menu
    this.$allMapsContainer.bind("click", this.closeAllModal);


    // FORMS IN MAINMENU
    this.formJSON = {
        header: "Заголовок",
        inputs: [
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "select", val: ["123", "321"], placeholder: "text", description: "description"},
            {type: "select2", val: ["123", "321"], placeholder: "text", description: "description"},
            {type: "send", val: "send", id: "sendForm", extclass: "sendForm"},
            {type: "cancel", val: "cancel", id: "cancelForm", extclass: "cancelForm"},            
        ],
     }    

    this.contextMenuGlobalOptions = function(){
        parent.closeContextMenu();

        eform.clearForm();
        eform.makeFromJSON(JSON.stringify(parent.formJSON));
        eform.showForm();
     }
    // TODO: touch event
    $("#optionsGlobal").bind("click", this.contextMenuGlobalOptions);

    this.initMainEvents();


    // ********** SET MAP **********
    this.setActiveMap = function(mapName){
        mapName = mapName ? mapName : "";
        var mapNum = opt.getOption("current", "activeMap");
        window[mapNum].setMapTilesLayer(new LeafletTiles(mapName));
     }

    this.setActiveMapForm = function(){
        var maps = opt.getOption("maps");

        var genArray = [
            {
                type: "header",
                text: "Select map",
            },
            {
                type: "paragraf",
                text: "Select map",
                active: true,
            },
            {
                type: "line",
                text: "cloudmate",
                callback: function(){
                    parent.setActiveMap("cloudmate");
                    parent.closeAllModal();
                },
            },                
        ];

        var menu = new CSSMenu("mapSelectMenu", genArray, true);

        parent.closeContextMenu(opt.getOption("html", "containerMainMenuId"));

     }

    // TODO: touch event
    $("#setMap").bind("click", this.setActiveMapForm);
}