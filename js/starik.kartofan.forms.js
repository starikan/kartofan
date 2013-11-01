"use strict"

var EditableForm = function(id){
    
    if (!id) {id = "eform"}

    this.$form;
    this.$formHeader;
    this.$formContent;

    this._initForm = function(id){

        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$form = $("div"+$id);

        this.$form.addClass("form-flat hide");

        if (!this.$form.find(".form-header").length){
            $("<div></div>").appendTo(this.$form).addClass("form-header");
        }

        if (!this.$form.find("div.form-content").length){
            $("<div></div>").appendTo(this.$form).addClass("form-content").append("<form/>");
        }

        this.$formHeader = $("div").find(".form-header");
        this.$formContent = $("div").find(".form-content > form");

     }

    this.clearForm = function(){
        if (this.$formHeader){
            this.$formHeader.empty();
        }

        if (this.$formContent){
            this.$formContent.empty();
        }
     }

    this.addHeader = function(header){
        if (!header){ return }
        this.$formHeader.append(header);
     }

    this.addInput = function(val, placeholder, tabindex, description){

        if (!val){ val=undefined }
        if (!tabindex && tabindex!==0){ tabindex=undefined }
        description = description ? description : "";

        $("<label>"+description+"</label>").appendTo(this.$formContent);

        $("<input/>").appendTo(this.$formContent).attr({
            "type": "text",
            "placeholder": placeholder,
            "value": val,
            "tabindex": tabindex,
        });
     }

    this.addSelect = function(val, placeholder, tabindex, description){

     }

    this.addSelect2 = function(val, placeholder, tabindex, description){

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

    this.addRadio = function(val, placeholder, tabindex, description){

     }

    this.addCheckbox = function(val, placeholder, tabindex, description){

     }

    this.addButton = function(val, id, extclass, tabindex, callback){
        if (!val){ val=undefined }
        if (!id){ id=undefined }
        if (!extclass){ extclass=undefined }
        if (!tabindex && tabindex!==0){ tabindex=undefined }

        $("<input/>").appendTo(this.$formContent).attr({
            "type": "submit",
            "value": val,
            "id": id,
            "tabindex": tabindex,
        }).addClass("button").addClass(extclass)
        // TODO: add touch
        .bind("click", callback);        
     }

    this.makeFromJSON = function(str){

        try {
            var json_inp = JSON.parse(str);
        } catch (e) {
            return false;
        }

        // console.log(json_inp, json_inp.inputs)

        if (!json_inp.header){json_inp.header = ""}
        // TODO: check json_inp.inputs is array
        // if (typeof json_inp.inputs === "undefined"){json_inp.inputs = []}

        this.addHeader(json_inp.header);

        for (var i=0, v=json_inp.inputs; i<json_inp.inputs.length; i++){

            if (v[i].type === "input"){
                this.addInput(v[i].val, v[i].placeholder, i+1, v[i].description);
            }

            else if (v[i].type === "select"){
                this.addSelect(v[i].val, v[i].placeholder, i+1, v[i].description);
            }

            else if (v[i].type === "select2"){
                this.addSelect2(v[i].val, v[i].placeholder, i+1, v[i].description);
            }

            else if (v[i].type === "send"){
                this.addButton(v[i].val, v[i].id, v[i].extclass, i+1, function(){
                    console.log("send")
                });
            }

            else if (v[i].type === "cancel"){
                this.addButton(v[i].val, v[i].id, v[i].extclass, i+1, function(){
                    console.log("cancel")
                });
            }
        }

        this.focusFirstField();

     }

    // TODO
    this.focusFirstField = function(){
        // console.log(this.$form.find("input")[0]);
        // $(this.$form.find("input")[0]).focus();
     }

    this.showForm = function(){
        this.$form.removeClass("hide");
     }

    this.hideForm = function(){
        this.$form.addClass("hide");
     }

    this._initForm(id);
 }

var CSSMenu = function(id, arr, show){
    parent = this;

    if (!id) {id = "nonamemenu"}
    if (!show) {show = false}

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
            $("<li><a><span>"+text+"</span></a></li>").appendTo($main);
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

    this.makeFromObj = function(){
        $.each(this.genArr, function(i, v){
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
        $('.cssmenu > ul > li ul').each(function(index, e){
            var count = $(e).find('li').length;
            var content = '<span class="cnt">' + count + '</span>';
            $(e).closest('li').children('a').append(content);
        });
        $('.cssmenu ul ul li:odd').addClass('odd');
        $('.cssmenu ul ul li:even').addClass('even');
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

    if (Array.isArray(this.genArr)){
        this.makeFromObj();
     }
 }
