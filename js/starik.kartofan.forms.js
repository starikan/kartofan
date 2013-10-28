"use strict"

var checkFormEnabled = function(){
    if (typeof eform === "undefined" || !(eform instanceof EditableForm)){
        window.eform = new EditableForm();
     }
}

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

    this.addInput = function(val, placeholder, tabindex){

        if (!val){ val=undefined }
        if (!tabindex && tabindex!==0){ tabindex=undefined }

        $("<input/>").appendTo(this.$formContent).attr({
            "type": "text",
            "placeholder": placeholder,
            "value": val,
            "tabindex": tabindex,
        });
     }

    this.addSelect = function(val, placeholder, tabindex){

        if (!val || !val.length){ val=[] }
        if (!tabindex && tabindex!==0){ tabindex=undefined }

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

    this.addSubmit = function(val, id, extclass, tabindex){
        if (!val){ val=undefined }
        if (!id){ id=undefined }
        if (!extclass){ extclass=undefined }
        if (!tabindex && tabindex!==0){ tabindex=undefined }

        $("<input/>").appendTo(this.$formContent).attr({
            "type": "submit",
            "value": val,
            "id": id,
            "tabindex": tabindex,
        }).addClass("button").addClass(extclass);        
     }

    this.makeFromJSON = function(str){
        try {
            var json = JSON.parse(str);
        } catch (e) {
            return false;
        }

        if (!json.header){json.header = ""}
        if (!json.rows || !json.rows.length){json.rows = []}
        if (!json.submit){json.header.val = ""}

        this.addHeader(json.header);

        var tabindex = 0;
        for (var i=0, v=json.rows; i<json.rows.length; i++){
            if (v[i].type === "input"){
                this.addInput(v[i].val, v[i].placeholder, tabindex);
                tabindex++;
            }
            else if (v[i].type === "select"){
                this.addSelect(v[i].val, v[i].placeholder, tabindex);
                tabindex++;
            }
        }
        for (var i=0, v=json.submit; i<json.submit.length; i++){
            this.addSubmit(v[i].val, v[i].id, v[i].extclass, tabindex);
            tabindex++;
        }
     }

    this.showForm = function(){
        this.$form.removeClass("hide");
     }

    this.hideForm = function(){
        this.$form.addClass("hide");
     }

    this._initForm(id);
 }
