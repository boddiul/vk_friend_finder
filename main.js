





var FUNCTION = 'function';
var UNDEFINED = 'undefined';
var subscribers = [];
var webFrameId = null;
var connectVersion = '1.2.0';
var isWeb = typeof window !== UNDEFINED && !window.AndroidBridge && !window.webkit;
var eventType = isWeb ? 'message' : 'VKWebAppEvent';

if (typeof window !== UNDEFINED) {

    //polyfill
    if (!window.CustomEvent) {
        (function() {
            function CustomEvent(event, params) {
                params = params || {bubbles: false, cancelable: false, detail: undefined};
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            };

            CustomEvent.prototype = window.Event.prototype;

            window.CustomEvent = CustomEvent;
        })();
    }

    window.addEventListener(eventType, function() {
        var args = Array.prototype.slice.call(arguments);
        var _subscribers = subscribers.slice();
        if (isWeb) {
            if (args[0].data.hasOwnProperty('webFrameId')) {
                delete args[0].data.webFrameId;
            }
            if (args[0].data.hasOwnProperty('connectVersion')) {
                delete args[0].data.connectVersion;
            }
            if (args[0].data.type && args[0].data.type === 'VKWebAppSettings') {
                webFrameId = args[0].data.frameId;
            } else {
                _subscribers.forEach(function(fn) {
                    fn({
                        detail: args[0].data
                    });
                });
            }
        } else {
            _subscribers.forEach(function(fn) {
                fn.apply(null, args);
            });
        }
    });
}

/**
 * Sends a message to native client
 *
 * @example
 * message.send('VKWebAppInit');
 *
 * @param {String} handler Message type
 * @param {Object} params Message data
 * @returns {void}
 */
function send(handler, params) {
    if (!params) {
        params = {};
    }

    var isClient = typeof window !== UNDEFINED;
    var androidBridge = isClient && window.AndroidBridge;
    var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
    var isDesktop = !androidBridge && !iosBridge;

    if (androidBridge && typeof androidBridge[handler] == FUNCTION) {
        androidBridge[handler](JSON.stringify(params));
    }
    if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) {
        iosBridge[handler].postMessage(params);
    }

    if (isDesktop) {
        parent.postMessage({
            handler: handler,
            params: params,
            type: 'vk-connect',
            webFrameId: webFrameId,
            connectVersion
        }, '*');
    }
};
/**
 * Subscribe on VKWebAppEvent
 *
 * @param {Function} fn Event handler
 * @returns {void}
 */
function subscribe(fn) {
    subscribers.push(fn);
};
/**
 * Unsubscribe on VKWebAppEvent
 *
 * @param {Function} fn Event handler
 * @returns {void}
 */
function unsubscribe(fn) {
    var index = subscribers.indexOf(fn);

    if (index > -1) {
        subscribers.splice(index, 1);
    }
};

/**
 * Checks if native client supports handler
 *
 * @param {String} handler Handler name
 * @returns {boolean}
 */
function supports(handler) {

    var isClient = typeof window !== UNDEFINED;
    var androidBridge = isClient && window.AndroidBridge;
    var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
    var desktopEvents = [
        "VKWebAppInit",
        "VKWebAppGetCommunityAuthToken",
        "VKWebAppAddToCommunity",
        "VKWebAppGetUserInfo",
        "VKWebAppSetLocation",
        "VKWebAppGetClientVersion",
        "VKWebAppGetPhoneNumber",
        "VKWebAppGetEmail",
        "VKWebAppGetGeodata",
        "VKWebAppSetTitle",
        "VKWebAppGetAuthToken",
        "VKWebAppCallAPIMethod",
        "VKWebAppJoinGroup",
        "VKWebAppAllowMessagesFromGroup",
        "VKWebAppDenyNotifications",
        "VKWebAppAllowNotifications",
        "VKWebAppOpenPayForm",
        "VKWebAppOpenApp",
        "VKWebAppShare",
        "VKWebAppShowWallPostBox",
        "VKWebAppScroll",
        "VKWebAppResizeWindow",
    ];

    if (androidBridge && typeof androidBridge[handler] == FUNCTION) return true;

    if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) return true;

    if (!iosBridge && !androidBridge && ~desktopEvents.indexOf(handler)) return true;

    return false;
};



access_token = -1

function getUserGroups() {
    send("VKWebAppCallAPIMethod", {
        "method":"groups.get",
        "request_id":"initGroups",
        "params": {
            "access_token":access_token,
            "v":"5.126"
        }});
}

function apiGetMembers(groupId)
{
    send("VKWebAppCallAPIMethod", {
        "method":"groups.getMembers",
        "request_id":"getMembers"+'_'+groupId,
        "params": {
            "group_id":groupId,
            "access_token":access_token,
            "v":"5.126"
        }});

}

TIME_DELAY = 233;

function getMembersStart(groups) {
    for (let i=0;i<10;i++) //groups.length
    {

        let g = groups[i];
        console.log(g);

        setTimeout(function() { apiGetMembers(g); }, TIME_DELAY*i);

    }
}

function checkMembersComplete() {

}

function checker(event)
{

    console.log(event)








    if (event.detail.type==="VKWebAppAccessTokenReceived"){
        access_token = event.detail.data.access_token

        getUserGroups();
    }

    if (event.detail.type==="VKWebAppCallAPIMethodResult") {


        let req = event.detail.data.request_id.split('_');

        switch ( req[0] ) {
            case "initGroups":
                getMembersStart(event.detail.data.response.items);
                break;

            case "getMembers":



                console.log('COMPLETE'+event.detail.data.response.count)
                break;
        }
    }

    if (event.detail.type==="VKWebAppCallAPIMethodFailed")
    {

        console.log('FAIL '+event.detail.data.error_data.error_reason.error_code+' '+event.detail.data.error_data.error_reason.error_msg);

        let req = event.detail.data.request_id.split('_');
        switch ( req[0] ) {
            case "getMembers":
                let group = req[1]
                setTimeout(function() { apiGetMembers(group); }, TIME_DELAY*i);
                break;
        }
    }

/*
    if (event.detail.type==="VKWebAppCallAPIMethodResult") {

        if (event.detail.data.request_id === "0") {

            document.getElementById("load").style.display = "none"
            try {
                crop = event.detail.data.response[0].crop_photo.crop
                var sz = event.detail.data.response[0].crop_photo.photo.sizes
                photo_url = sz[sz.length - 1].url
                img.src = photo_url
            }
            catch (e) {
                img.src = "white.jpg"
            }



        }
        else if (event.detail.data.request_id === "1") {


            let upload_url = event.detail.data.response.upload_url
            let dataURL = canvas.toDataURL()

            console.log(dataURL)

            $.ajax({
                type: "POST",
                url: "https://lentachimg.aaaaa.team/",
                data: {
                    upload_url: upload_url,
                    imgBase64: dataURL
                }
            }).done(function(o) {

                console.log(o)

                img_hash = o.hash

                send("VKWebAppCallAPIMethod", {
                    "method":"photos.saveWallPhoto",
                    "request_id":"2",
                    "params": {
                        "server":o.server,
                        "photo":o.photo,
                        "hash":o.hash,

                        "access_token":t,
                        "v":"5.122"
                    }});



            });


        }
        else if (event.detail.data.request_id === "2") {

            console.log("_________")

            var owner_id = event.detail.data.response[0].owner_id;
            var photo_id = event.detail.data.response[0].id;
            console.log
            //VK.callMethod("showProfilePhotoBox",event.detail.data.response.photo_hash)


            send("VKWebAppShowWallPostBox", {
                "message":"#ЖывеБеларусь",
                "attachments":"photo"+owner_id+"_"+photo_id+",https://vk.com/app7565667"
            });

        }


    }


    if (event.detail.type==="VKWebAppShowStoryBoxResult" ||
        event.detail.type==="VKWebAppShowStoryBoxFailed") {
        document.getElementById("load").style.display = "none"
    }


    if (event.detail.type==="VKWebAppShowWallPostBoxResult" ||
        event.detail.type==="VKWebAppShowWallPostBoxFailed") {
        document.getElementById("load").style.display = "none"
    }*/

}





send("VKWebAppInit", {});
send("VKWebAppGetAuthToken", {"app_id": 7691623,"scope":""});
subscribe(checker)




sendId = function(userId)
{
    console.log(userId)
}


sendId(1000);