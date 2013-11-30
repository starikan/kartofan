$.pluck = function(arr, key) { 
    return $.map(arr, function(e) { return e[key]; }) 
}

$.noty.defaults = {
    layout: 'topRight',
    theme: 'defaultTheme',
    type: 'alert',
    text: '',
    dismissQueue: true, // If you want to use queue feature set this true
    template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
    animation: {
        open: {height: 'toggle'},
        close: {height: 'toggle'},
        easing: 'swing',
        speed: 500 // opening & closing animation speed
    },
    timeout: 6000, // delay for closing event. Set false for sticky notifications
    force: false, // adds notification to the beginning of queue when set to true
    modal: false,
    maxVisible: 6, // you can set max visible notification for dismissQueue true option
    closeWith: ['click'], // ['click', 'button', 'hover']
    callback: {
        onShow: function() {},
        afterShow: function() {},
        onClose: function() {},
        afterClose: function() {}
    },
    buttons: false // an array of buttons
};

// https://github.com/selevit/translate-js
function loc(params, lang) {

    if (typeof opt === "undefined" || !(opt instanceof Options)) { return }

    var lang = lang || opt.getOption("global", "lang"),
        localization = opt.getOption("localization", lang),
        translated = 'ERROR', 
        code;

    if (!localization) { 
        console.log("Error: Cant`t get localization to " + lang);
        return "ERROR";
    }

    console.log(localization)
    params = params.toLowerCase().split(':');

    if (params.length) {
        for (var i = 0; i < params.length; i++) {
            code = params[i];
            if (typeof localization[code] === 'object') {
                localization = localization[code];
            }
            if (typeof localization[code] === 'string') {
                translated = localization[code];
                break;
            }
        }
    }

    return translated;
};