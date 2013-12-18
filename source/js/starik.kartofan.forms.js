"use strict"

var TopMenu = (function(){

    var instance;

    return function Construct_singletone () {
        if (instance) {
            return instance;
        }
        if (this && this.constructor === Construct_singletone) {
            instance = this;
        } else {
            return new Construct_singletone();
        }

    window.opt = new Options();
    window.mapseditor = new MapsEditor();
    window.stageeditor = new StageEditor();
    window.fastmoving = new FastMoving();
    window.bases = new Bases();
    window.gps = new GPS();

    var _this = this;

    this.topMenuId = arguments[0];
    this.mapsContainerId = arguments[1];

    if (!this.topMenuId || !this.mapsContainerId) return;

    this.topMenuArray = [
        { type: "topMenuMenu", loc: "topMenu:topMenuMenu" },

        { type: "topMenuMaps", loc: "topMenu:topMenuMaps" },
        { type: "topMenuMapSet", loc: "topMenu:topMenuMapSet", callback: mapseditor.setMapMenu },
        { type: "topMenuMapEdit", loc: "topMenu:topMenuMapEdit", callback: mapseditor.editMapMenu },
        { type: "topMenuMapExternal", loc: "topMenu:topMenuMapExternal", callback: mapseditor.externalMapMenu },
        { type: "topMenuMapSave", loc: "topMenu:topMenuMapSave", callback: mapseditor.editMapActiveWindow },
        
        { type: "topMenuStages", loc: "topMenu:topMenuStages" },
        { type: "topMenuStageSet", loc: "topMenu:topMenuStageSet", callback: stageeditor.setStageMenu },
        { type: "topMenuStageEdit", loc: "topMenu:topMenuStageEdit", callback: stageeditor.editStageMenu },
        { type: "topMenuStageExternal", loc: "topMenu:topMenuStageExternal", callback: stageeditor.externalStageMenu },
        { type: "topMenuStageEditView", loc: "topMenu:topMenuStageEditView", callback: stageeditor.editView },
        { type: "topMenuStageSave", loc: "topMenu:topMenuStageSave", callback: stageeditor.saveStage },
        
        { type: "topMenuMove", loc: "topMenu:topMenuMove" },
        { type: "topMenuMoveMove", loc: "topMenu:topMenuMoveMove", callback: fastmoving.moveToPointMenu },
        { type: "topMenuMoveAdd", loc: "topMenu:topMenuMoveAdd", callback: fastmoving.editPoint },
        { type: "topMenuMoveEdit", loc: "topMenu:topMenuMoveEdit", callback: fastmoving.editPointMenu },
        
        { type: "topMenuUtils", loc: "topMenu:topMenuUtils" },
        { type: "topMenuUtilsToggleFulscreen", loc: "topMenu:topMenuUtilsToggleFulscreen", callback: mapseditor.toggleFullScreen },
        
        { type: "topMenuOptions", loc: "topMenu:topMenuOptions" },
        { type: "topMenuOptGlobal", loc: "topMenu:topMenuOptGlobal", callback: "" },
        { type: "topMenuOptUpdate", loc: "topMenu:topMenuOptUpdate", callback: bases.syncIn },
        { type: "topMenuOptLang", loc: "topMenu:topMenuOptLang", callback: opt.setLang },
        { type: "topMenuOptReset", loc: "topMenu:topMenuOptReset", callback: bases._clearAllBases },
        
        { type: "topMenuJSON", loc: "topMenu:topMenuJSON" },
        { type: "topMenuJSONMaps", loc: "topMenu:topMenuJSONMaps", callback: function(){opt.getAllDataFromJSON("maps")} },
        { type: "topMenuJSONStages", loc: "topMenu:topMenuJSONStages", callback: function(){opt.getAllDataFromJSON("stages")} },
        { type: "topMenuJSONMoves", loc: "topMenu:topMenuJSONMoves", callback: function(){opt.getAllDataFromJSON("points")} },
        { type: "topMenuJSONAll", loc: "topMenu:topMenuJSONAll", callback: function(){opt.getAllDataFromJSON()} },
        { type: "topMenuJSONExport", loc: "topMenu:topMenuJSONExport", callback: opt.exportAllInJSON },
        
        { type: "topMenuGPS", loc: "topMenu:topMenuGPS" },
        { type: "topMenuGPSStart", loc: "topMenu:topMenuGPSStart", callback: gps.startGPS },
        { type: "topMenuGPSStop", loc: "topMenu:topMenuGPSStop", callback: gps.stopGPS },
        
        { type: "topMenuHelp", loc: "topMenu:topMenuHelp" },
        { type: "topMenuHelpTourMain", loc: "topMenu:topMenuHelpTourMain", callback: "" },
        
        { type: "topMenuPin", callback: function(){_this.toggleAlwaywMenuPin()} },
        { type: "test", callback: function(){} },
        

        { type: "topMenuStageEditor", loc: "topMenuStageEditor:topMenuStageEditor" },
        { type: "topMenuStageEditorSaveView", loc: "topMenuStageEditor:topMenuStageEditorSaveView", callback: stageeditor.saveView },
        { type: "topMenuStageEditorAddMap", loc: "topMenuStageEditor:topMenuStageEditorAddMap", callback: stageeditor.addMapToStage },
        { type: "topMenuStageEditorRemoveMap", loc: "topMenuStageEditor:topMenuStageEditorRemoveMap", callback: stageeditor.removeMapFromStage },
        { type: "topMenuStageEditorEditControls", loc: "topMenuStageEditor:topMenuStageEditorEditControls", callback: stageeditor.editMapsControls },
     ];

    this.showTopMenuView = function() {
        var $mapsContainer = $("#"+_this.mapsContainerId);
        var $topMenuContainer = $("#"+_this.topMenuId);

        $mapsContainer.css({"top": 45+"px"});
        $topMenuContainer.css({"z-index": 9999, "top": 0+"px"});
     }

    this.hideTopMenuView = function() {
        if (opt.getOption("current", "viewTopMenuShowAlways")) return;

        var $mapsContainer = $("#"+_this.mapsContainerId);
        var $topMenuContainer = $("#"+_this.topMenuId);

        $mapsContainer.css({"top": "0px"});
        $topMenuContainer.css({"z-index": 0, "top": "-45px"});
     }

    this.showStageMenu = function() {
        var $stageMenu = $("#topMenuStageEditor");
        $stageMenu.removeClass("hide-for-small-only hide-for-medium-up hide-for-large-up hide-for-xlarge-up hide-for-xxlarge-up")
     }

    this.hideStageMenu = function() {
        var $stageMenu = $("#topMenuStageEditor");
        $stageMenu.addClass("hide-for-small-only hide-for-medium-up hide-for-large-up hide-for-xlarge-up hide-for-xxlarge-up")
     }

    this.toggleAlwaywMenuPin = function() {
        opt.setOption("current", "viewTopMenuShowAlways", 1 - opt.getOption("current", "viewTopMenuShowAlways"));

        this.setActiveOnButtons();
        this._updateTopMenuView();
     }

    this.setActiveOnButtons = function() {

        // Pin Button
        if (opt.getOption("current", "viewTopMenuShowAlways")){
            $(".topMenuPin").parent().addClass("active");
        }
        else {
            $(".topMenuPin").parent().removeClass("active");
        }
     }

    this._updateTopMenuView = function() {

        var topMenuVisible = opt.getOption("current", "viewTopMenuShowAlways");

        topMenuVisible ? this.showTopMenuView() : this.hideTopMenuView();

     }

    this._setLocalization = function() {
        var $topMenu = $("#"+this.topMenuId);

        $.each(this.topMenuArray, function(i, v) {
            if (v.loc) {

                var $elements = $topMenu.find("."+v.type);
                var local = loc(v.loc, "", "", $elements.html());

                $.each($elements, function(){
                    var $el = $(this);
                    if ($el.html() && local && $el.html() == $el.text()){
                        $el.html(local);
                    }
                })
            }
        })
     }

    this._setFunctions = function() {
        var $topMenu = $("#"+this.topMenuId);

        $.each(this.topMenuArray, function(i, v) {
            if (v.callback) {
                // TODO: touch
                $topMenu.find("."+v.type).click(v.callback);
            }
        })
     }

    this._setLocalization();
    this._setFunctions();
    this._updateTopMenuView();
    this.setActiveOnButtons();

 }}());

var InfoMenu = (function(){

    var instance;

    return function Construct_singletone () {
        if (instance) {
            return instance;
        }
        if (this && this.constructor === Construct_singletone) {
            instance = this;
        } else {
            return new Construct_singletone();
        }

    window.opt = new Options();

    var _this = this;

    this.infoMenuArray = [

     ];

    this.showInfoMenuView = function() {
        opt.setOption("appVars", "viewInfoMenu", true);
        _this._updateInfoMenuView();
     }

    this.hideInfoMenuView = function() {
        opt.setOption("appVars", "viewInfoMenu", false);
        _this._updateInfoMenuView();
     }

    this._updateInfoMenuView = function(){

        var infoVisible = opt.getOption("appVars", "viewInfoPanel") == undefined ? opt.getOption("current", "viewInfoPanelShowAlways") : opt.getOption("appVars", "viewInfoPanel");

        var $mapsContainer = $("#containerKartofan");
        var $infoContainer = $("#infoMenuKartofan");

        var bottom = infoVisible ? 15 : 0;
        $mapsContainer.css({"bottom": bottom+"px"});
     }

    this._updateInfoMenuView();

 }}());

/**
    arr = [
        "group": {
            id: {
                title: "", 
                callback: function
            }
        }
    ]
*/
var AccordionMenu = function(arr, id) {

    if (arr == undefined || typeof arr != "object" || $.isEmptyObject(arr)){ return }
    if (!id) {id = "nonamemenu"}

    var _this = this;

    this.$container;
    this.$menu;
    this.arr = arr;

    this._initMenu = function(){
        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$container = $("div"+$id);
        this.$container.empty();
        this.$container.append("<dl class='accordion' data-accordion></dl>");

        this.$container.arcticmodal({
            afterClose: function(){
                _this.$container.empty();
            }
        });
     }

    this._generateAccordeon = function() {
        var $accordion = this.$container.find(".accordion");
        var count = 0;
        $.each(this.arr, function(i, v){

            var active = Object.keys(_this.arr).length === 1 ? "active" : "";
            
            var $accordionHtml = $("<dd><a href='#accordion{0}'>{1}</a>\
            <div id='accordion{0}' class='content {2}'></div></dd>"
            .format([count, i, active]));

            var rows = [];
            $.each(v, function(j, data){
                rows.push('<div class="row" id="{0}">\
                    <div class="small-12 large-12 columns">\
                    {1}</div></div>'.format(["menuItem"+count, data.title]));
                count++;
            });

            $accordionHtml.find(".content").html(rows.join(""));
            $accordion.append($accordionHtml);
        });

        $(document).foundation();
     }

    this._setCallbacks = function() {
        var count = 0;
        $.each(this.arr, function(i, v){
            $.each(v, function(j, data){
                $("#menuItem"+count).click(function(){
                    _this.$container.arcticmodal('close');
                    data.callback(j);
                })
                count++;
            });
        });
     }

    this._initMenu();
    this._generateAccordeon();
    this._setCallbacks();
 }

var FoundationForm = function(arr, id) {
    if (arr == undefined || typeof arr != "object" || $.isEmptyObject(arr)){ return }
    if (!id) return;

    var _this = this;

    this.$form;
    this.arr = arr; 
    this.data = {};
    this.checkFormFlag = true;
    
    this._initForm = function(){
        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
            this.$form = $("div"+$id);
            this.$form.empty();
            this.$form.append("<form></form>");
        }
        else {
            this.$form = $("div"+$id);
        }

        this.clearForm();
        this.showForm();
     }

    this.clearForm = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem;

            $elem = _this.$form.find("input."+v.type+", select."+v.type+", textarea."+v.type);
            if ($elem.length) {
                $elem.val("");
                $elem.html("");                
            };

            $elem = _this.$form.find("a."+v.type);
            if ($elem.length) {
                $elem.off("click");
            }
        })        
     }

    this.setLocalization = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem = _this.$form.find("span."+v.type+", label."+v.type+", a."+v.type);
            if (!$elem.length || !v.loc) return;
            $elem.html(loc(v.loc));
        })
     }

    this.setValues = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem = _this.$form.find("input."+v.type+", select."+v.type+", textarea."+v.type);
            if (!$elem.length || v.val == undefined) return;
            $elem.val(v.val);
        });
     }

    this.setOptions = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem;

            $elem = _this.$form.find("input."+v.type);
            if ($elem.length && v.options && typeof v.options == "object" && v.options.length){
                $elem.attr("list", v.type+"_list");
                var $datalist = $("<datalist></datalist>").attr("id", v.type+"_list");
                $elem.parent().append($datalist);
                $.each(v.options, function(j, option){
                    $datalist.append("<option>"+option+"</option>");
                });
            }

            $elem = _this.$form.find("select."+v.type);
            if ($elem.length && v.options && typeof v.options == "object" && v.options.length){
                $.each(v.options, function(j, option){
                    $elem.append("<option>"+option+"</option>");
                });
            }

        });

     }

    this.setCallbacks = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem = _this.$form.find("a."+v.type);
            if (!$elem.length || v.callback == undefined) return;
            // TODO: touch
            $elem.on("click", function(){
                _this.checkForm();
                _this.getValues();
                v.callback(_this)
            });
        })        
     }

    this.checkForm = function() {
        this.$form.find("form").submit();
        var $errors = this.$form.find("[data-invalid]");
        this.checkFormFlag = !$errors.length;
     }

    this.getValues = function() {
        $.each(this.arr, function(i, v){
            if (!v.type) return;
            var $elem = _this.$form.find("input."+v.type+", select."+v.type+", textarea."+v.type);
            if (!$elem.length || !v.name) {
                return;
            }
            _this.data[v.name] = $elem.val();            
        });
     }

    this.showForm = function() {
        this.$form.removeClass("hide");
        this.$form.arcticmodal({
            afterClose: function(){
                _this.hideForm();
            }
        });        
     }

    this.hideForm = function() {
        this.$form.addClass("hide");
        this.$form.arcticmodal("close");
     }

    this._initForm();
    this.setLocalization();
    this.setOptions();
    this.setValues();
    this.setCallbacks();
    this.checkForm();
    this.getValues();
}

var EditableForm = function(arr, funcs, id, show){
    
    var parent = this;

    if (!id) {id = "eform"};
    if (!show) {show = true};
    if (!funcs) {funcs = {}};

    this.arr = arr;
    this.funcs = funcs;

    this.$form;
    this.$formContent;

    this.fields = [];

    this.data;
    this.check;
    this.checkForm = true;

    this._initForm = function(id){

        var $id = "#"+id;

        if (!$("div").is($id)){
            $("<div></div>").appendTo($("body")).attr("id", id);
        }

        this.$form = $("div"+$id);
        this.$form.empty().addClass("eform hide");

        $("<div></div>").appendTo(this.$form).addClass("eform-header");
        $("<div></div>").appendTo(this.$form).addClass("eform-content");

        this.$formContent = this.$form.find(".eform-content");

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
        if (v.classList && $.isArray(v.classList)){ v.classList = v.classList.join(" ") }
        if (!v.check) { v.check = /.?/; }
        if (v.description){
            $("<label>"+v.description+"</label>").appendTo(this.$formContent).addClass(v.classList);
        }        
        if (!v.options){v.options = []}
        v.check = v.check ? new RegExp(v.check) : new RegExp(".?");
        v.tabindex = this.$formContent.find("input, select").length + 1;
        v.rows = v.rows ? v.rows : 1;

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
        // $input.addClass("form-control flat");
        $input.appendTo(this.$formContent);

        var $datalist = $("<datalist></datalist>").attr({
            "id": v.id+"_list"
        });
        if (!v.options.length){
            $.each(v.options, function(i, option){
                $datalist.append($("<option></option>").val(option))
            })
        };
        $datalist.appendTo(this.$formContent);

        this._checkVal(v, $input);
        this.fields.push($input);
     }

    this.addSelect = function(v){
        v = this._checkInputAttr(v);

        var $select = $("<select/>").attr({
            "type": "select",
            "id": v.id,
            "value": v.val,
            "tabindex": v.tabindex,
            "check": v.check,
        });
        // $select.addClass("form-control flat");
        $select.appendTo(this.$formContent);

        $.each(v.options, function(i, v){
            $("<option>"+v+"</option>").appendTo($select);
        });

        this._checkVal(v, $select);
        this.fields.push($select);
     }

    this.addTags = function(v){
        v = this._checkInputAttr(v);

        var $tags = $("<input/>").appendTo(this.$formContent).attr({
            "type": "tags",
            "id": v.id,
            "tabindex": v.tabindex,
            "check": v.check,
            "data-role": "tagsinput",
            "value": v.val,
        })

        $tags.tagsinput();

        this._checkVal(v, $tags);
        this.fields.push($tags);
     }

    this.addTextArea = function(v){
        v = this._checkInputAttr(v);

        var $input = $("<textarea/>").attr({
            "id": v.id,
            "value": v.val,
            "tabindex": v.tabindex,
            "check": v.check,
            "rows": v.rows,
        });
        $input.appendTo(this.$formContent);
        this._checkVal(v, $input);
        this.fields.push($input);
     }

    this.addRadio = function(v){

     }

    this.addCheckbox = function(v){
        v = this._checkInputAttr(v);

        var $input = $("<input/>").attr({
            "type": "checkbox",
            "id": v.id,
            "value": v.val,
            "tabindex": v.tabindex,
        });
        $input.appendTo(this.$formContent);
        this._checkVal(v, $input);
        this.fields.push($input);
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

        // TODO: add touch
        try {
            $button.bind("click", function(){v.callback(parent)});
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
        //     callback: callback function,
        //     rows: lines count for textarea
        // }

        arr = arr ? arr : this.arr;
        funcs = funcs ? funcs : this.funcs;

        if (!$.isArray(arr)){ return }

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
                case "tags":
                    parent.addTags(v, f);
                    break;            
                case "button":
                    parent.addButton(v, f);
                    break; 
                case "datalist":
                    parent.addDatalist(v, f);
                    break;             
                case "checkbox":
                    parent.addCheckbox(v, f);
                    break;    
                case "textarea":
                    parent.addTextArea(v, f);
                    break;  
            }   
        })

        this.checkAllFields();

        this.focusFirstField();

     }

    this.fillForm = function(vals){

        if (!vals || $.isEmptyObject(vals)) {return}

        $.each(vals, function(id, val){
            $.each(parent.fields, function(j, field){
                if (field.attr("id") == id){

                    // Set vals
                    switch (field.attr("type")){

                        case "tags":
                            var tags = val.split(",");
                            $.each(tags, function(num, tag){
                                field.tagsinput('add', tag);
                            })      
                            break;

                        case "checkbox":
                            field.prop('checked', val);                                    
                            break;

                        default:
                            field.val(val);
                    }
                }
            })
        })            

        this.checkAllFields();
     }

    this.fillOptions = function(options){
        if (!options || $.isEmptyObject(options)) {return}
        
        $.each(options, function(id, val){
            $.each(parent.fields, function(j, field){
                if (field.attr("id") == id){

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
                        
                        if (field.attr("type") == "tags"){
                            // TODO: Add suggestions on tags
                            // http://timschlechter.github.io/bootstrap-tagsinput/examples/bootstrap3/
                        }
                    }
                }
            })
        })
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

        var data = {};
        var check = {};

        this.checkAllFields();

        $.each(this.fields, function(i, v){
            var $v = $(v);

            switch (v.attr("type")){
                case "checkbox":
                    data[v.attr("id")] = $v.prop('checked')
                    break;
                default:
                    data[v.attr("id")] = $v.val();
            }

            check[v.attr("id")] = !$v.hasClass("noCheck");
        })

        this.data = data;
        this.check = check;

     }

    this._initForm(id);
    this.makeFromObj();
 }

var CSSMenu = function(arr, id, show){
    
    var parent = this;

    if (arr == undefined){ return }
    if (!id) {id = "nonamemenu"}
    if (show == undefined) {show = true}

    this.$container;
    this.$menu;

    this.arr = arr;

    // ************ MAIN FUCNTIONS ************

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

    // ************ ADD FIELDS ************

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
            $li.addClass("openOnStart");
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
            $li.bind("click", function(){
                parent.hideMenu();
                callback();
            });
        }
        else {
            $li.bind("click", this.hideMenu);
        }
     }

    // ************ BULK ************

    this.makeFromObj = function(arr){

        arr = arr ? arr : this.arr;

        if (!$.isArray(arr)){ return }

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
        this.openOnStart();
     }

    this.groupedCollectionMenu = function(collection, callback, show, groupSelector, header){

        if (!collection) { return }
        var show = show == undefined ? true : show;
        groupSelector = groupSelector ? groupSelector : "group"

        var groups = $.pluck(collection, groupSelector);
        groups = unique(groups);
        groups.sort();

        var genArray = [{ type: "header", text: header }];

        $.each(groups, function(g, group){

            var dataInGroup = {};
            $.each(collection, function(i, v){
                if (!v.group && !group || v.group == group){
                    dataInGroup[i] = v;
                }
            })

            if (!$.isEmptyObject(dataInGroup)){
                
                if (!group) {group = "Others"};
                genArray.push({ type: "paragraf", text: group });
                
                $.each(dataInGroup, function(i, vi){
                    genArray.push({
                        type: "line", 
                        text: vi.title ? vi.title : "Noname",
                        callback: function(){
                            callback(i, vi);
                        },
                    })
                });
            }
        })

        this.arr = genArray;

        this._initMenu();
        this.makeFromObj(genArray); 

        show ? this.showMenu() : "";
     }

    this.groupedCollectionMenuExteranlJSON = function(collection, callback, show, header){

        var show = show == undefined ? true : show;

        var extData = opt.getOption("global", "externalFeeds");

        var menuObj = [{ type: "header", text: header }]; 

        $.each(extData, function(i, extJSON){

            $.getJSON(extJSON.url, function(data){
                var genArr = [ { type: "paragraf", text: extJSON.title } ];
                try {
                    data = JSON.parse(Base64.decode(data.content));
                }
                catch(e){}

                $.each(data[collection], function(j, data){
                    genArr.push({
                        type: "line", 
                        text: data.title ? data.title : "Noname",
                        callback: function(){ 
                            console.log(j, data)
                            callback(j, data) 
                        },
                    });
                });

                parent._initMenu();
                parent.makeFromObj(genArr);
                show ? parent.showMenu() : "";

            })
        });
     }

    // ************ ACTIVATE ************

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

    this.openOnStart = function(){
        $('.cssmenu > ul > li.openOnStart > a').trigger( "click" );
     }

    this._initMenu();
    this.makeFromObj();

 }
