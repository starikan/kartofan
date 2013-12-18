"use strict"

$(document).foundation({
    live_validate : true,
});

document.oncontextmenu = function(){ return false };

// ********** ONLINE/OFFLINE EVENT **********

if (window.navigator.onLine != undefined){
    window.addEventListener('online',  function(){
        console.log("online");
        noty({text: loc("offline:online"), type: "error"});            
    });
    window.addEventListener('offline', function(){
        console.log("offline");
        noty({text: loc("offline:offline"), type: "error"});
    });
 }

window.mapsInstance = [];

window.opt = new Options();        // Options
