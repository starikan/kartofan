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
        this.$container.empty().addClass("hide");

        $("<div></div>").appendTo(this.$container).attr("id", "cssmenu");

        this.$menu = $("div"+$id+" > div#cssmenu");

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

     }

    this.addLine = function(text, classList, idList, callback){

     }

    this.makeFromObj = function(){

     }

    this._initMenu();
}