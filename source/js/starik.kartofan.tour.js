var Tour = function() {

    var _this = this;

    this.steps;
    this.$container;

    // TODO: сделать функцию устаноки этих шаблонов
    this.$_htmlStep = [
        "<div class='tourStep panel small-12 medium-6'>",
        "  <div class='tourContent'>",
        "    <h4 class='tourTitle'></h4>",
        "    <p class='tourDescription'></p>",
        "  </div>",
        "</div>"
    ].join("");

    this.$_htmlButton = "<a class='button'></a>";

    this.buttonFuncs = {
        "prev": function(){

        },
        "cancel": function(){

        },
        "next": function(){

        },
    }

    this.init = function() {
        $("body").append("<div id='tourContainer'></div>");
        this.$container = $("#tourContainer");
     }

    this.setOptions = function() {

     }

    this.setSteps = function(steps) {
        if (!steps || !$.isArray(steps)) return;
        this.steps = steps;
     }

    this.generateTour = function() {
        $.each(this.steps, function(i, v){
            var $step = $(_this.$_htmlStep);

            $.each(v.buttons, function(b, butt){
                var $button = $(_this.$_htmlButton)
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
                // .css("display", "none")
                .appendTo(_this.$container);

            console.log($step)
        })
     }

    this.init();

 }