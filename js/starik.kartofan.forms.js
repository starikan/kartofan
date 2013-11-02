"use strict"

var EditableForm = function(id, arr, show){
    
    parent = this;

    if (!id) {id = "eform"}
    if (!show) {show = true}

    this.genArr = arr;

    this.$form;
    this.$formContent;

    this._initForm = function(id){

        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$form = $("div"+$id);
        this.$form.empty().addClass("cssform hide");

        $("<div></div>").appendTo(this.$form).addClass("form-header");
        $("<div></div>").appendTo(this.$form).addClass("form-content").append("<form/>");

        this.$formContent = this.$form.find(".form-content > form");

        if (show){ this.showForm() }

     }

    this.addHeader = function(header, classList){
        if (classList && Array.isArray(classList)){ classList = classList.join(" ") }
        if (header){
            parent.$form.find(".form-header").append(header).addClass(classList);
        }
     }

    this.addInput = function(val, id, placeholder, description, tabindex, classList, check){

        if (classList && Array.isArray(classList)){ classList = classList.join(" ") }
        if (!check) { check = /.?/; }

        if (description){
            $("<label>"+description+"</label>").appendTo(this.$formContent).addClass(classList);
        }

        var $input = $("<input/>").appendTo(this.$formContent).attr({
            "type": "text",
            "id": id,
            "placeholder": placeholder,
            "value": val,
            "tabindex": tabindex,
        });
        // TODO: не ясно как это будет на мобильных работать
        $input.addClass(classList).bind("keyup change", function(){
            if (check.test(this.value)){
                $input.removeClass("noCheck");
            }
            else {
                $input.addClass("noCheck");
            }
        });
     }

    this.addSelect = function(val, placeholder, tabindex, description, classList){

     }

    this.addSelect2 = function(val, placeholder, tabindex, description, classList){

        if (!val || !val.length){ val=[] }
        if (!tabindex && tabindex!==0){ tabindex=undefined }

        $("<label>"+description+"</label>").appendTo(this.$formContent);

        var $select = $("<select/>").appendTo(this.$formContent).attr({
            "tabindex": tabindex,    
        });;

        $.each(val, function(i,v){
            var $elem = $("<option/>")
            $elem.append(v);
            $select.append($elem);
        });

        $select.select2({
            "placeholder": placeholder,
        });

     }

    this.addTextArea = function(val, placeholder, tabindex, description, classList){

     }

    this.addRadio = function(val, placeholder, tabindex, description, classList){

     }

    this.addCheckbox = function(val, placeholder, tabindex, description, classList){

     }

    this.addButton = function(val, id, classList, tabindex, callback){
        if (!val){ val=undefined }
        if (!id){ id=undefined }
        if (!classList){ classList=undefined }
        if (!tabindex && tabindex!==0){ tabindex=undefined }

        $("<input/>").appendTo(this.$formContent).attr({
            "type": "submit",
            "value": val,
            "id": id,
            "tabindex": tabindex,
        }).addClass("button").addClass(classList)
        // TODO: add touch
        .bind("click", callback);        
     }

    this.makeFromObj = function(arr){

        arr = arr ? arr : this.genArr

        if (!Array.isArray(arr)){ return }

        $.each(arr, function(i, v){
            switch (v.type){
                case "header":
                    parent.addHeader(v.text, v.classList);
                    break;
                case "input":
                    parent.addInput(v.val, v.id, v.placeholder, v.description, i, v.classList, v.check);
                    break;
            }            
        })

        this.focusFirstField();

     }

    this.fillForm = function(vals){

     }

    // TODO
    this.focusFirstField = function(){
        // console.log(this.$form.find("input")[0]);
        // $this.$form.find("input")[0].focus();
     }

    this.showForm = function(){
        this.$form.removeClass("hide");
     }

    this.hideForm = function(){
        this.$form.addClass("hide");
     }

    this._initForm(id);
    this.makeFromObj();
 }

var CSSMenu = function(id, arr, show){
    parent = this;

    if (!id) {id = "nonamemenu"}
    if (!show) {show = true}

    this.$container;
    this.$menu;

    this.genArr = arr;

    this._initMenu = function(){
        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$container = $("div"+$id)
        this.$container.empty().addClass("hide cssmenu_container");

        $("<div><ul></ul></div>").appendTo(this.$container).addClass("cssmenu");

        this.$menu = $("div"+$id+" > div.cssmenu > ul");

        if (show){ this.showMenu() }

     }

    this.showMenu = function(){
        this.$container.removeClass("hide");
     }

    this.hideMenu = function(){
        this.$container.addClass("hide");
     }

    this.addHeader = function(text, classList){

     }

    this.addParagraf = function(text, classList, idList, callback, active){
        
        text = text ? text : "No title";
        classList = classList ? classList : [];
        idList = idList ? idList : [];
        active = active ? active : false;

        $("<li><a><span>"+text+"</span></a></li>").appendTo(this.$menu).addClass("paragraf");
        var $li = this.$menu.find(".paragraf:last-child");
        $.each(classList, function(i, v){
            $li.addClass(v);
        });
        $.each(idList, function(i, v){
            $li.attr("id", v);
        });       
        // TODO: touch
        if (callback){
            $li.bind("click", callback);
        }
        if (active){
            $li.addClass("active");
        }
     }

    this.addLine = function(text, classList, idList, callback){

        text = text ? text : "No title";
        classList = classList ? classList : [];
        idList = idList ? idList : [];

        var $main = this.$menu.find(".paragraf:last-child");
        $main.addClass("has-sub");

        var $ul = $main.find("ul");

        if (!$ul.length){
            $("<ul><li><a><span>"+text+"</span></a></li></ul>").appendTo($main);
        }
        else {
            $("<li><a><span>"+text+"</span></a></li>").appendTo($ul);
        }

        var $li = $main.find("li:last-child");
        $.each(classList, function(i, v){
            $li.addClass(v);
        });
        $.each(idList, function(i, v){
            $li.attr("id", v);
        });       
        // TODO: touch
        if (callback){
            $li.bind("click", callback);
        }
     }

    this.makeFromObj = function(arr){

        arr = arr ? arr : this.genArr

        if (!Array.isArray(arr)){ return }

        $.each(arr, function(i, v){
            switch (v.type){
                case "header":
                    parent.addHeader(v.text, v.classList);
                    break;
                case "paragraf":
                    parent.addParagraf(v.text, v.classList, v.idList, v.callback, v.active);
                    break;
                case "line":
                    parent.addLine(v.text, v.classList, v.idList, v.callback);
                    break;
            }
        });

        this.activateMenu();
     }

    this.activateMenu = function(){

        // Add counts
        $('.cssmenu > ul > li ul').each(function(index, e){
            var count = $(e).find('li').length;
            var content = '<span class="cnt">' + count + '</span>';
            if (!$(e).closest('li').children('a').find("span.cnt").length){
                $(e).closest('li').children('a').append(content);
            }
        });

        $('.cssmenu ul ul li:odd').addClass('odd');
        $('.cssmenu ul ul li:even').addClass('even');

        // Removed click event because when call several times it`s conflict each other
        $('.cssmenu > ul > li > a').unbind("click");

        $('.cssmenu > ul > li > a').click(function() {
            $('.cssmenu li').removeClass('active');
            $(this).closest('li').addClass('active'); 
            var checkElement = $(this).next();
            if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
                $(this).closest('li').removeClass('active');
                checkElement.slideUp('normal');
            }
            if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
                $('.cssmenu ul ul:visible').slideUp('normal');
                checkElement.slideDown('normal');
            }
            if($(this).closest('li').find('ul').children().length == 0) {
                return true;
            } else {
                return false;   
            }     
        });        
     }

    this._initMenu();
    this.makeFromObj();

 }
