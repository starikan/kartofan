"use strict"


var Events = function(opt){

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
        // Disable context menu
        // http://www.quirksmode.org/dom/events/contextmenu.html
        document.oncontextmenu = function(){ return false; };

        this.eventResizeWindow();
        this.eventContextMenu();
        this.eventClickOutMenu();

        this.contextMenuGlobalOptions();
     }

    // WINDOW RESIZE
    this.eventResizeWindow = function(e){
        window.onresize = function(e){
            for (var i=0; i<LeafletMap.prototype.instances.length; i++){
                LeafletMap.prototype.instances[i].refreshMapAfterResize();
            }            
        }
     }


    // MAIN CONTEXT MENU AND FORMS    
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

    this.eventContextMenu = function(e){
        window.oncontextmenu = this.openContextMenu;
     }

    // TODO: touch event to context menu
    this.eventClickOutMenu = function(e){
        this.$allMapsContainer.bind("click", function(){
            parent.closeContextMenu();
            parent.closeAllForms();
        });
     }


    // FORMS IN MAINMENU
    this.formJSON = {
        header: "Заголовок",
        rows: [
            {type: "input", val: "", placeholder: "text"},
            {type: "input", val: "", placeholder: "text"},
            {type: "input", val: "", placeholder: "text"},
            {type: "input", val: "", placeholder: "text"},
            {type: "select", val: ["123", "321"], placeholder: "text"},
            {type: "select", val: ["123", "321"], placeholder: "text"},
        ],
        submit: [
            {val: "send", id: "sendForm", extclass: "sendForm"},
            {val: "cancel", id: "cancelForm", extclass: "cancelForm"},
        ]
     }    

    this.contextMenuGlobalOptions = function(){
        $("#optionsGlobal").bind("click", function(){
            eform.makeFromJSON(JSON.stringify(parent.formJSON));
            parent.closeContextMenu();
            eform.showForm();
         })        
     }

    this.initMainEvents();
}