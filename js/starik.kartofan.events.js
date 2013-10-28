"use strict"

var openContextMenu = function(e){
    // http://www.quirksmode.org/dom/events/contextmenu.html
    var $mainmenu = $("#mainmenu");
    if (!$mainmenu.is(":visible")){
        $mainmenu.removeClass("hide");
    }
    return false;        
 }

var closeContextMenu = function(e){
    var $mainmenu = $("#mainmenu");
    if ($mainmenu.is(":visible")){
        $mainmenu.addClass("hide");
    }
    return false; 
 }

// TODO: it`s bad realization. Need more independance from class name
var closeAllForms = function(){
    $(".form-flat").addClass("hide");
 }

var initMainMenu = function(){
    $('#cssmenu > ul > li ul').each(function(index, e){
      var count = $(e).find('li').length;
      var content = '<span class="cnt">' + count + '</span>';
      $(e).closest('li').children('a').append(content);
    });
    $('#cssmenu ul ul li:odd').addClass('odd');
    $('#cssmenu ul ul li:even').addClass('even');
    $('#cssmenu > ul > li > a').click(function() {
      $('#cssmenu li').removeClass('active');
      $(this).closest('li').addClass('active'); 
      var checkElement = $(this).next();
      if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        $(this).closest('li').removeClass('active');
        checkElement.slideUp('normal');
      }
      if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
        $('#cssmenu ul ul:visible').slideUp('normal');
        checkElement.slideDown('normal');
      }
      if($(this).closest('li').find('ul').children().length == 0) {
        return true;
      } else {
        return false;   
      }     
    });
 }

var eventResizeWindow = function(e){
    for (var i=0; i<LeafletMap.prototype.instances.length; i++){
        LeafletMap.prototype.instances[i].refreshMapAfterResize();
    }
 }

window.onresize = eventResizeWindow;
document.oncontextmenu = openContextMenu;
// TODO: touch event to context menu
$("#container").bind("click", function(){
    closeContextMenu();
    closeAllForms();
 });

initMainMenu();




// FORMS

// Global options form
$("#optionsGlobal").bind("click", function(){
    checkFormEnabled();

    var formJSON = {
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
    eform.makeFromJSON(JSON.stringify(formJSON));
    closeContextMenu();
    eform.showForm();
 })