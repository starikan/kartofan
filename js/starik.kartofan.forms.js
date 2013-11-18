"use strict"

var EditableForm = function(id, arr, funcs, show){
    
    parent = this;

    if (!id) {id = "eform"};
    if (!show) {show = true};
    if (!funcs) {funcs = {}};

    this.arr = arr;
    this.funcs = funcs;

    this.$form;
    this.$formContent;

    this.fields = [];

    this.allData;
    this.checkForm = true;

    this._initForm = function(id){

        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$form = $("div"+$id);
        this.$form.empty().addClass("eform hide");

        $("<div></div>").appendTo(this.$form).addClass("eform-header");
        $("<div></div>").appendTo(this.$form).addClass("eform-content").append("<form/>");

        this.$formContent = this.$form.find(".eform-content > form");

        if (show){ this.showForm() }

     }

    this.checkAllFields = function(){
        this.checkForm = true;
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
                    parent.checkForm = false;
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
        v.check = v.check ? new RegExp(v.check) : new RegExp(".?");
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


    // ***** ADDING FIELDS ******

    this.addHeader = function(v){
        v = this._checkInputAttr(v);
        if (v.val){
            parent.$form.find(".eform-header").append(v.val).addClass(v.classList);
        }
     }

    this.addInput = function(v){
        v = this._checkInputAttr(v);

        var $input = $("<input/>").attr({
            "type": "text",
            "id": v.id,
            "placeholder": v.placeholder,
            "value": v.val,
            "tabindex": v.tabindex,
            "check": v.check,
        });
        $input.appendTo(this.$formContent);
        this._checkVal(v, $input);
        this.fields.push($input);
     }

    this.addDatalist = function(v){
        v = this._checkInputAttr(v);

        var $input = $("<input/>").attr({
            "type": "datalist",
            "id": v.id,
            "placeholder": v.placeholder,
            "value": v.val,
            "tabindex": v.tabindex,
            "check": v.check,
            "list": v.id+"_list"
        });
        $input.appendTo(this.$formContent);

        var $datalist = $("<datalist></datalist>").attr({
            "id": v.id+"_list"
        });
        if (!v.options.length){
            $.each(v.options, function(i, option){
                $datalist.appent($("<option></option>").val(option))
            })
        };
        $datalist.appendTo(this.$formContent);

        this._checkVal(v, $input);
        this.fields.push($input);
     }

    this.addSelect = function(v){
        v = this._checkInputAttr(v);

        var $select = $("<select/>").attr({
            "id": v.id,
            "value": v.val,
            "tabindex": v.tabindex,
            "check": v.check,
        });
        
        $select.appendTo(this.$formContent);

        $.each(v.options, function(i, v){
            $("<option>"+v+"</option>").appendTo($select);
        });

        this._checkVal(v, $select);
        this.fields.push($select);
     }

    // this.addSelect2 = function(v){

    //     v = this._checkInputAttr(v);
        
    //     var $select = $("<div></div>").attr({
    //         "id": v.id,
    //         "tabindex": v.tabindex,
    //         "check": v.check,
    //     });
    //     $select.appendTo(this.$formContent);

    //     var data = [];
    //     $.each(v.options, function(i, v){
    //         data.push({ id: i, text: v })
    //     });

    //     $select.select2({
    //         placeholder: v.placeholder,
    //         query: function (query) {
    //             var localData = {results: data}
    //             localData.results.push({id: data.length+1, text: query});
    //             query.callback(localData);
    //         }            
    //     });

    //     $select.select2("data", data);
    //     $select.select2("val", v.val);

    //     this._checkVal(v, $select);
    //     this.fields.push($select);
    //  }

    this.addSelect2Tags = function(v){
        v = this._checkInputAttr(v);

        var $tags = $("<input/>").appendTo(this.$formContent).attr({
            "id": v.id,
            "tabindex": v.tabindex,
            "check": v.check,
            "value": v.options,
        })

        $tags.select2({ tags: [], tokenSeparators: [","] });

        this._checkVal(v, $tags);
        this.fields.push($tags);
     }

    this.addTextArea = function(v){

     }

    this.addRadio = function(v){

     }

    this.addCheckbox = function(v){

     }

    this.addButton = function(v, f){
        v = this._checkInputAttr(v);

        var $button = $("<input/>").appendTo(this.$formContent).attr({
            "type": "button",
            "value": v.val,
            "id": v.id,
            "tabindex": v.tabindex,
        });
        $button.addClass("button");

        // TODO: add touch
        try {
            $button.bind(f.events, function(){f.callback(parent)});
        }
        catch(e){
            console.log(e);
        };

        this._checkVal(v, $button);
     }


    // ******* MAKE FORM *******

    this.makeFromObj = function(arr, funcs){

        // v = {
        //     type: header|input|select|select2,
        //     val: "value",
        //     id: "id",
        //     placeholder: "placeholder",
        //     check: "regexp to checking the value",
        //     description: "description",
        //     options: [] for select options, tags
        //     callback: callback function
        // }

        arr = arr ? arr : this.arr;
        funcs = funcs ? funcs : this.funcs;

        if (!Array.isArray(arr)){ return }

        $.each(arr, function(i, v){
            var f = funcs[v.id]
            switch (v.type){
                case "header":
                    parent.addHeader(v, f);
                    break;
                case "input":
                    parent.addInput(v, f);
                    break;
                case "select":
                    parent.addSelect(v, f);
                    break;
                case "select2":
                    parent.addSelect2(v, f);
                    break;            
                case "select2tags":
                    // parent.addSelect2Tags(v, f);
                    break;            
                case "button":
                    parent.addButton(v, f);
                    break; 
                case "datalist":
                    parent.addDatalist(v, f);
                    break;             }   
        })

        this.checkAllFields();

        this.focusFirstField();

     }

    this.fillForm = function(vals, options){
        console.log(vals, $.isEmptyObject(vals))

        if (!vals || $.isEmptyObject(vals)) {return}

        $.each(vals, function(id, val){
            $.each(parent.fields, function(j, field){
                if (field.attr("id") == id){

                    // Set vals
                    field.val(val);
                    // field.select2("val", val);

                    // Set options
                    if (options && !$.isEmptyObject(options) && $.isArray(options[id]) && options[id].length){

                        if (field.attr("type") == "datalist"){
                            $.each(options[id], function(o, option){
                                $("datalist#"+id+"_list").append($("<option></option>").val(option))
                            })
                        }

                        if (field.attr("type") == "select"){
                            console.log("Select options sdd: "+options[id]);
                        }  

                    }

                    console.log(id, val)
                }
            })
        })            

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
        var allData = {
            "val": {},
            "check": {},
        };
        this.checkAllFields();
        $.each(this.fields, function(i, v){
            var $v = $(v);
            allData.val[v.attr("id")] = $v.val();
            allData.check[v.attr("id")] = !$v.hasClass("noCheck");
        })
        this.allData = allData;
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

    this.arr = arr;

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

        arr = arr ? arr : this.arr;

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
