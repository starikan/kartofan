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

    this.checkAllFields = function(){
        this.$form.find("input, select").each(function(i, v){
            var $v = $(v);
            var check = $v.attr("check")
            if (check){
                var value = $v.val();
                var checkReg = new RegExp(check.substring(1, check.length-1));
                if (checkReg.test(value)){
                    $v.removeClass("noCheck");
                }
                else {
                    $v.addClass("noCheck");
                }                
            }
        })

     }

    this._checkInputAttr = function(v){
        if (v.classList && Array.isArray(v.classList)){ v.classList = v.classList.join(" ") }
        if (!v.check) { v.check = /.?/; }
        if (v.description){
            $("<label>"+v.description+"</label>").appendTo(this.$formContent).addClass(v.classList);
        }        
        if (!v.options){v.options = []}
        v.tabindex = this.$formContent.find("input, select").length + 1;

        return v;
     }

    // TODO: не ясно как это будет на мобильных работать
    this._checkVal = function(v, $item){
        $item.addClass(v.classList).bind("keyup change", function(){
            if (v.check){
                var value = $(this).val();
                if (v.check.test(value)){ $item.removeClass("noCheck") }
                else { $item.addClass("noCheck") }                
            }

        });
     }

    this.addHeader = function(v){
        v = this._checkInputAttr(v);
        if (v.val){
            parent.$form.find(".form-header").append(v.val).addClass(v.classList);
        }
     }

    this.addInput = function(v){
        v = this._checkInputAttr(v);

        var $input = $("<input/>").appendTo(this.$formContent).attr({
            "type": "text",
            "id": v.id,
            "placeholder": v.placeholder,
            "value": v.val,
            "tabindex": v.tabindex,
            "check": v.check,
        });
        this._checkVal(v, $input);
     }

    this.addSelect = function(v){
        v = this._checkInputAttr(v);

        var $select = $("<select/>").appendTo(this.$formContent).attr({
            "id": v.id,
            "value": v.val,
            "tabindex": v.tabindex,
            "check": v.check,
        });
        $.each(v.options, function(i, v){
            $("<option>"+v+"</option>").appendTo($select);
        });
        this._checkVal(v, $select);
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

    this.addSelect2Tags = function(v){

     }

    this.addTextArea = function(v){

     }

    this.addRadio = function(v){

     }

    this.addCheckbox = function(v){

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

        // v = {
        //     type: header|input|select|select2,
        //     val: "value",
        //     id: "id",
        //     placeholder: "placeholder",
        //     check: "regexp to checking the value",
        //     description: "description",
        //     options: [] for select options
        // }

        arr = arr ? arr : this.genArr

        if (!Array.isArray(arr)){ return }

        $.each(arr, function(i, v){
            switch (v.type){
                case "header":
                    parent.addHeader(v);
                    break;
                case "input":
                    parent.addInput(v);
                    break;
                case "select":
                    parent.addSelect(v);
                    break;
            }            
        })

        this.checkAllFields();

        this.focusFirstField();

     }

    this.fillForm = function(vals){
        if (Array.isArray(vals)){ 
            // [ { val: "img", id: "server"}, ]
            $.each(vals, function(i, v){
                parent.$form.find("#"+v.id).val(v.val);
            })
        } 
        else if (vals) {
            // {server: "img"}
            $.each(vals, function(i, v){
                parent.$form.find("#"+i).val(v);
            })            
        }



        this.checkAllFields();
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

    this.getAllData = function(){
        var allData = [];
        this.$form.find("input, select").each(function(i, v){
            var $v = $(v);
            allData.push({
                "id": v.id,
                "value": $v.val(),
                "checkFlag": !$v.hasClass("noCheck"),
            });
        })
        return allData;
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
