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

    this.$mainmenu = $(opt.html.containerMainMenu);
    this.$allMapsContainer = $(opt.html.containerAllMaps);

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
    // Disable context menu
    // http://www.quirksmode.org/dom/events/contextmenu.html
    document.oncontextmenu = function(){ return false };

    this.openContextMenu = function(e){
        if (!parent.$mainmenu.is(":visible")){ parent.$mainmenu.removeClass("hide") }
     }    

    this.closeContextMenu = function(e){
        if (parent.$mainmenu.is(":visible")){ parent.$mainmenu.addClass("hide") }
     }

    // TODO: it`s bad realization. Need more independance from class name
    this.closeAllForms = function(){
        $(".form-flat").addClass("hide");
     }

    window.oncontextmenu = this.openContextMenu;

    this.eventClickOutMenu = function(e){
        parent.closeContextMenu();
        parent.closeAllForms();
     }

    // TODO: touch event to context menu
    this.$allMapsContainer.bind("click", this.eventClickOutMenu);


    // FORMS IN MAINMENU
    this.formJSON = {
        header: "Заголовок",
        inputs: [
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "input", val: "", placeholder: "text", description: "description"},
            {type: "select", val: ["123", "321"], placeholder: "text", description: "description"},
            {type: "select", val: ["123", "321"], placeholder: "text", description: "description"},
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
        parent.setActiveMap("cloudmate");
     }

    // TODO: touch event
    $("#setMap").bind("click", this.setActiveMapForm);
}