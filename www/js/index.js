
//var app = {
//    // Application Constructor
//    initialize: function() {
//        this.bindEvents();
//    },
//    // Bind Event Listeners
//    //
//    // Bind any events that are required on startup. Common events are:
//    // 'load', 'deviceready', 'offline', and 'online'.
//    bindEvents: function() {
//        document.addEventListener('deviceready', this.onDeviceReady, false);
//    },
//    // deviceready Event Handler
//    //
//    // The scope of 'this' is the event. In order to call the 'receivedEvent'
//    // function, we must explicitly call 'app.receivedEvent(...);'
//    onDeviceReady: function() {
//        app.receivedEvent('deviceready');
//    },
//    // Update DOM on a Received Event
//    receivedEvent: function(id) {
//        var parentElement = document.getElementById(id);
//        var listeningElement = parentElement.querySelector('.listening');
//        var receivedElement = parentElement.querySelector('.received');

//        listeningElement.setAttribute('style', 'display:none;');
//        receivedElement.setAttribute('style', 'display:block;');

//        console.log('Received Event: ' + id);
//    }
//};


//var app = {
//    onDeviceReady: function () {
//        // Initialize Leadbolt SDK with your API Key
//        AppTracker.startSession("PiBRJHzWCYY89EOVy83aULDo8WYxWZLq");
//        // cache Leadbolt Ad without showing it
//        AppTracker.loadModuleToCache("inapp");
//    },
//};

function gameOver() {
    // call this when you want to display the Leadbolt Interstitial
    AppTracker.loadModule("inapp");
}

canvas.addEventListener('onModuleLoaded', function (e) {
    console.log('Ad loaded successfully - ' + e.placement);
    // Add code here to pause game and/or all media including audio
});
canvas.addEventListener('onModuleFailed', function (e) {
    if (e.cached) {
        console.log('Ad failed to cache - ' + e.placement);
    } else {
        console.log('Ad failed to display - ' + e.placement);
    }
});
canvas.addEventListener('onModuleClosed', function (e) {
    console.log('Ad closed by user - ' + e.placement);
    // Add code here to resume game and/or all media including audio
});
canvas.addEventListener('onModuleCached', function (e) {
    console.log('Ad cached successfully - ' + e.placement);
});
canvas.addEventListener('onModuleClicked', function (e) {
    console.log('Ad clicked by user - ' + e.placement);
});
canvas.addEventListener('onMediaFinished', function (e) {
    if (e.viewCompleted) {
        console.log('User finished watching rewarded video');
    } else {
        console.log('User skipped watching rewarded video');
    }
});