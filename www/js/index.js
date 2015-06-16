
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


var cordova = {
    /** 
     * Methods to add/remove your own addEventListener hijacking on document + window.
     */
    addWindowEventHandler: function (event) {
        return (windowEventHandlers[event] = channel.create(event));
    },
    addStickyDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.createSticky(event));
    },
    addDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.create(event));
    },
    removeWindowEventHandler: function (event) {
        delete windowEventHandlers[event];
    },
    removeDocumentEventHandler: function (event) {
        delete documentEventHandlers[event];
    },
    /**
     * Retrieve original event handlers that were replaced by Cordova
     *
     * @return object
     */
    getOriginalHandlers: function () {
        return {
            'document': { 'addEventListener': m_document_addEventListener, 'removeEventListener': m_document_removeEventListener },
            'window': { 'addEventListener': m_window_addEventListener, 'removeEventListener': m_window_removeEventListener }
        };
    },
    /**
     * Method to fire event from native code
     * bNoDetach is required for events which cause an exception which needs to be caught in native code
     */
    fireDocumentEvent: function (type, data, bNoDetach) {
        var evt = createEvent(type, data);
        if (typeof documentEventHandlers[type] != 'undefined') {
            if (bNoDetach) {
                documentEventHandlers[type].fire(evt);
            }
            else {
                setTimeout(function () {
                    // Fire deviceready on listeners that were registered before cordova.js was loaded.
                    if (type == 'deviceready') {
                        document.dispatchEvent(evt);
                    }
                    documentEventHandlers[type].fire(evt);
                }, 0);
            }
        } else {
            document.dispatchEvent(evt);
        }
    },
    fireWindowEvent: function (type, data) {
        var evt = createEvent(type, data);
        if (typeof windowEventHandlers[type] != 'undefined') {
            setTimeout(function () {
                windowEventHandlers[type].fire(evt);
            }, 0);
        } else {
            window.dispatchEvent(evt);
        }
    },

    /**
     * Plugin callback mechanism.
     */
    // Randomize the starting callbackId to avoid collisions after refreshing or navigating.
    // This way, it's very unlikely that any new callback would get the same callbackId as an old callback.
    callbackId: Math.floor(Math.random() * 2000000000),
    callbacks: {},
    callbackStatus: {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9
    },
    exec: function (service, action, callbackId, argsJson) {
        console.log('I am in coeadova Exec');
        return prompt(argsJson, 'gap:' + JSON.stringify([service, action, callbackId]));
    },
    /**
     * Called by native code when returning successful result from an action.
     */
    callbackSuccess: function (callbackId, args) {
        try {
            cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
        } catch (e) {
            console.log("Error in error callback: " + callbackId + " = " + e);
        }
    },

    /**
     * Called by native code when returning error result from an action.
     */
    callbackError: function (callbackId, args) {
        // TODO: Deprecate callbackSuccess and callbackError in favour of callbackFromNative.
        // Derive success from status.
        try {
            cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
        } catch (e) {
            console.log("Error in error callback: " + callbackId + " = " + e);
        }
    },

    /**
     * Called by native code when returning the result from an action.
     */
    callbackFromNative: function (callbackId, success, status, args, keepCallback) {
        var callback = cordova.callbacks[callbackId];
        if (callback) {
            if (success && status == cordova.callbackStatus.OK) {
                callback.success && callback.success.apply(null, args);
            } else if (!success) {
                callback.fail && callback.fail.apply(null, args);
            }

            // Clear callback if not expecting any more results
            if (!keepCallback) {
                delete cordova.callbacks[callbackId];
            }
        }
    },
    addConstructor: function (func) {
        channel.onCordovaReady.subscribe(function () {
            try {
                func();
            } catch (e) {
                console.log("Failed to run constructor: " + e);
            }
        });
    }
};

var AppTracker = {
    startSession: function (apikey, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "startSession", [apikey]);
    },
    closeSession: function (successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "closeSession", []);
    },
    event: function (name, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "event", [name]);
    },
    event: function (name, value, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "event", [name, value]);
    },
    transaction: function (name, value, currency, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "transaction", [name, value, currency]);
    },
    loadModule: function (location, userData, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "loadModule", [location, userData]);
    },
    loadModuleToCache: function (location, userData, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "loadModuleToCache", [location, userData]);
    },
    setCrashHandlerStatus: function (enable, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "setCrashHandlerStatus", [enable]);
    },
    fixAdOrientation: function (orientation, successcallback, errorcallback) {
        cordova.exec(successcallback, errorcallback, "AppTracker", "fixAdOrientation", [orientation]);
    }
};

var app = {
    onDeviceReady: function () {
        // Initialize Leadbolt SDK with your API Key
        AppTracker.startSession("PiBRJHzWCYY89EOVy83aULDo8WYxWZLq");
        // cache Leadbolt Ad without showing it
        AppTracker.loadModuleToCache("inapp");
    },
};

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