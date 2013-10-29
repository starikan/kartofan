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

    this.addSubmit = function(val, id, extclass, tabindex, callback){
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

        console.log(json_inp, json_inp.inputs)

        if (!json_inp.header){json_inp.header = ""}
        // TODO: check json_inp.inputs of array
        // if (typeof json_inp.inputs === "undefined"){json_inp.inputs = []}


        this.addHeader(json_inp.header);

        var tabindex = 0;
        for (var i=0, v=json_inp.inputs; i<json_inp.inputs.length; i++){

            if (v[i].type === "input"){
                this.addInput(v[i].val, v[i].placeholder, tabindex, v[i].description);
            }

            else if (v[i].type === "select"){
                this.addSelect(v[i].val, v[i].placeholder, tabindex, v[i].description);
            }

            else if (v[i].type === "send"){
                this.addSubmit(v[i].val, v[i].id, v[i].extclass, tabindex, function(){
                    console.log("send")
                });
            }

            else if (v[i].type === "cancel"){
                this.addSubmit(v[i].val, v[i].id, v[i].extclass, tabindex, function(){
                    console.log("cancel")
                });
            }

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
