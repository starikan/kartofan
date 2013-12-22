var Tour = function() {

    var _this = this;

    this.steps;
    this.$container;
    this.currId;

    this._htmlStep = [
        "<div class='tourStep panel small-12 medium-6'>",
        "  <div class='tourContent'>",
        "    <h4 class='tourTitle'></h4>",
        "    <p class='tourDescription'></p>",
        "  </div>",
        "</div>"
     ].join("");

    this._htmlButton = "<a class='button'></a>";

    this.buttonFuncs = {
        "prev": function(){
            var prev = _this.findPrevStep(_this.currId);
            _this.showStep(prev);
        },
        "cancel": function(){
            _this.showStep();
        },
        "next": function(){
            var next = _this.findNextStep(_this.currId);
            _this.showStep(next);
        },
        "goto": function(){
            var gotoId = undefined
            $.each(_this.getStep(_this.currId).buttons, function(i, v){
                if (v.func === "goto") gotoId = v.id;
            });
            _this.showStep(gotoId);
        },        
     }

    this.init = function() {
        $("#tourContainer").remove();
        $("body").append("<div id='tourContainer'></div>");
        $("body").append("<div id='tourOverlay1' class='tourOverlay'></div>");
        $("body").append("<div id='tourOverlay2' class='tourOverlay'></div>");
        $("body").append("<div id='tourOverlay3' class='tourOverlay'></div>");
        $("body").append("<div id='tourOverlay4' class='tourOverlay'></div>");
        this.$container = $("#tourContainer");
     }

    this.setStepHTML = function(text) {
        if (!text) return;

        this._htmlStep = text;
     }

    this.setButtonHTML = function(text) {
        if (!text) return;

        this._htmlButton = text;
     }

    this.setOptions = function() {
        // Настройки по умолчанию
     }

    this.setSteps = function(steps) {
        if (!steps || !$.isArray(steps)) return;
        this.steps = steps;
     }

    this.getStep = function(id) {
        var step;
        $.each(_this.steps, function(i, v){
            if (v.id === id) step = v;
        });
        return step;
     }

    this.generateTour = function() {
        $.each(this.steps, function(i, v){
            var $step = $(_this._htmlStep);

            $.each(v.buttons, function(b, butt){
                var $button = $(_this._htmlButton)
                    .addClass(butt.addClass)
                    .html(butt.title)
                    .click(_this.buttonFuncs[butt.func]);

                $step.append($button);
            })
            
            $.each(v.content, function(t, text){
                $step.find("."+t).html(text);
            })

            $step
                .attr("id", "_id_"+v.id)
                .css("position", "absolute")
                .css("width", v.width)
                .css("height", v.height)
                .css("top", v.top)
                .css("left", v.left)
                .css("display", "none")
                .css("z-index", "10000")
                .css("-webkit-transform", "translate("+v.dleft+","+v.dtop+")")
                .css("-moz-transform", "translate("+v.dleft+","+v.dtop+")")
                .css("-ms-transform", "translate("+v.dleft+","+v.dtop+")")
                .css("-o-transform", "translate("+v.dleft+","+v.dtop+")")
                .css("transform", "translate("+v.dleft+","+v.dtop+")")

                .appendTo(_this.$container);
        })
     }

    this.startTour = function() {
        if (!this.steps || !this.steps.length) return;
        this.showStep(this.steps[0].id);
     }

    this.showStep = function(id) {
        this.$container.find(".tourStep")
            .css("display", "none");

        $.each(this.steps, function(i, v){
            $(v.target).removeClass(v.targetAddClass);
        })

        this.hideOverlay();

        if (!id) return;

        this.currId = id;

        this.$container.find("#_id_"+id)
            .css("display", "block");

        $.each(this.steps, function(i, v){
            if (v.id === id) $(v.target).addClass(v.targetAddClass);
        });

        this.showOverlay(id);

     }

    this.findNextStep = function(id) {
        var len = this.steps.length;
        var next = false;
        $.each(this.steps, function(i, v){
            if (v.id === id && i<len-1){
                next = _this.steps[i+1].id;
            }
        });
        return next;
     }

    this.findPrevStep = function(id) {
        var len = this.steps.length;
        var prev = false;
        $.each(this.steps, function(i, v){
            if (v.id === id && i>0){
                prev = _this.steps[i-1].id;
            }
        });
        return prev;
     }

    this.hideOverlay = function() {
        $(".tourOverlay").css("display", "none");
     }

    this.showOverlay = function(id) {

        var step = this.getStep(id);

        if (!step || !step.opacityLayer) return;

        var $target = $(step.target);

        $("#tourOverlay1")
            .css("top", "0px")
            .css("left", "0px")
            .css("width", $target.offset().left)
            .css("height", $(document).height())
            .css("position", "absolute")
            .css("display", "block")
            .css("z-index", "9999")
            .css("background-color", "black")
            .css("opacity", step.opacityLayer);

        $("#tourOverlay2")
            .css("top", "0px")
            .css("left", $target.offset().left)
            .css("width", $target.width())
            .css("height", $target.offset().top)
            .css("position", "absolute")
            .css("display", "block")
            .css("z-index", "9999")
            .css("background-color", "black")
            .css("opacity", step.opacityLayer);

        $("#tourOverlay3")
            .css("top", $target.offset().top + $target.height())
            .css("left", $target.offset().left)
            .css("width", $target.width())
            .css("height", $(document).height() - $target.offset().top - $target.height())
            .css("position", "absolute")
            .css("display", "block")
            .css("z-index", "9999")
            .css("background-color", "black")
            .css("opacity", step.opacityLayer);

        $("#tourOverlay4")
            .css("top", "0px")
            .css("left", $target.width()+$target.offset().left)
            .css("width", $target.width()+$target.offset().left)
            .css("height", $(document).height())
            .css("position", "absolute")
            .css("display", "block")
            .css("z-index", "9999")
            .css("background-color", "black")
            .css("opacity", step.opacityLayer);                        

     }

    this.init();

 }