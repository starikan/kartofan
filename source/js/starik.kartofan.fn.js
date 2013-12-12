$.pluck = function(arr, key) { 
    return $.map(arr, function(e) { return e[key]; }) 
 }

function unique(array){
    return array.filter(function(el, index, arr) {
        return index == arr.indexOf(el);
    });
 }

function Dec2Bin(n) {
    for (var s = ''; n != 0;
    (n >>>= 1)) s = ((n & 1) ? '1' : '0') + s;
    return s;
 }

String.prototype.format = String.prototype.f = function(options) {

    options = options ? options : [];

    var s = this,
        i = options.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), options[i]);
    }        

    return s;
 };

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
function loc(params, options, lang, orig) {

    window.opt = new Options();

    var lang = lang || opt.getOption("global", "lang"),
        translated = orig ? orig : 'ERROR', 
        code;

    var localization = opt.getOption("localization", "en_US");
    var localization_ext = opt.getOption("localization", lang)
    $.each(localization, function(i, v){
        try {$.extend(v, localization_ext[i])}
        catch(e){}
    })

    if (!localization) { 
        console.log("Error: Cant`t get localization to " + lang);
        return "ERROR";
    }

    params = params.split(':');

    if (params.length) {
        for (var i = 0; i < params.length; i++) {
            code = params[i];
            if (typeof localization[code] === 'string') {
                translated = localization[code];
                break;
            }
            if (typeof localization[code] === 'object') {
                localization = localization[code];
            }

        }
    }

    if (options){
        if (!$.isArray(options)){ options = [options] }
        translated = translated.format(options);
    }

    return translated;
 };