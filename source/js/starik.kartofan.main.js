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

// ********** CLOCK **********
(function clockloop(){
    var currentTime = new Date ( );

    var currentHours = currentTime.getHours ( );
    var currentMinutes = currentTime.getMinutes ( );
    var currentSeconds = currentTime.getSeconds ( );

    // Pad the minutes and seconds with leading zeros, if required
    currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
    currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
    currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;

    // // Choose either "AM" or "PM" as appropriate
    // var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";

    // // Convert the hours component to 12-hour format if needed
    // currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

    // // Convert an hours component of "0" to "12"
    // currentHours = ( currentHours == 0 ) ? 12 : currentHours;

    // Compose the string for display
    var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds;

    // Update the time display
    getElementsByClass("infoMenuTime")[0].innerHTML = currentTimeString;

    requestAnimFrame(clockloop);
 })();

window.mapsInstance = [];

window.opt = new Options();        // Options
