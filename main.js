





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



access_token = -1;



apiQueue = [];
apiFails = 0;
apiCalls = 0;

userMainData = {};

function sendAPI(data,priority) {


    apiQueue.push(data);
    /*
    if (priority)
    {

    }
    else
    {

    }*/
}


function getUserGroups() {


    /*

    send("VKWebAppCallAPIMethod", {
        "method":"groups.get",
        "request_id":"initGroups",
        "params": {
            "extended":1,
            "access_token":access_token,
            "v":"5.126"
        }});


     */

    sendAPI({"method":"groups.get",
        "request_id":"initGroups",
        "params": {
            "extended":1,
            "access_token":access_token,
            "v":"5.126"}});
}


function apiGetMembersExecute(type,groupIds,offsets)
{


    //console.log(type,groupIds,offsets)


    let ss = 'return [';
    let gg = '';
    for (let i=0;i<groupIds.length;i++)
    {
        ss+='API.groups.getMembers({"group_id":'+groupIds[i]+',"offset":'+offsets[i]+'})';
        gg+=groupIds[i]+'_'+offsets[i];

        if (i<groupIds.length-1)
        {
            ss+=',';
            gg+='_';
        }

    }
    ss+='];'


    //console.log(ss);


    /*
    send("VKWebAppCallAPIMethod", {
        "method":"execute",
        "request_id":"getMembersExecute_"+type+'_'+gg,
        "params": {
            "code":ss,
            "access_token":access_token,
            "v":"5.126"
        }});
*/

    sendAPI({
        "method":"execute",
        "request_id":"getMembersExecute_"+type+'_'+gg,
        "params": {
            "code":ss,
            "access_token":access_token,
            "v":"5.126"
        }});


}

/*
function apiGetMembers(groupId)
{

    sendAPI({
        "method":"groups.getMembers",
        "request_id":"getMembers"+'_'+groupId,
        "params": {
            "group_id":groupId,
            "access_token":access_token,
            "v":"5.126"
        }});


}
*/



TIME_DELAY = 333;



//totalGroupsToCheck = -1;
//checkedGroups = -1;





function getMembersStart(groups) {

    //checkedGroups = 0;
    //totalGroupsToCheck = groups.length;




    userGroups = groups;


    groupIds = [];
    offsets = [];
    for (let i=0;i<userGroups.length;i++)
    {

        userGroups[i]['scanned'] = false;
        userGroups[i]['failed'] = false;
        groupIds.push(userGroups[i]['id']);
        offsets.push(0);

    }

    for (let i=0;i<groupIds.length;i+=25)
    {

        let gg = groupIds.slice(i,i+25);
        let oo = offsets.slice(i,i+25);

        //console.log(gg);
        //setTimeout(function() {  }, TIME_DELAY*i/25);
        apiGetMembersExecute('start',gg,oo);
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

            /*case "getMembers":


                checkedGroups+=1;

                console.log('COMPLETE '+req[1]+' '+event.detail.data.response.count+' '+checkedGroups+'/'+totalGroupsToCheck)


                break;*/

            case "getMembersExecute":


                let groupsIds = [];
                let offsets = [];
                for (let i=2;i<req.length;i+=2)
                {
                    groupsIds.push(Number(req[i]));
                    offsets.push(Number(req[i+1]));
                }





                for (let i=0;i<groupsIds.length;i++)
                {
                    let groupPos = userGroups.findIndex(function (e) {
                        return e['id']===groupsIds[i];
                    });

                    if (event.detail.data.response[i]===false)
                    {
                        userGroups[groupPos]['failed'] = true;
                        userGroups[groupPos]['scanned'] = true;
                        continue;
                    }


                    let sz = event.detail.data.response[i].items.length;
                    for (let k=0;k<sz;k++)
                    {
                        let uu = event.detail.data.response[i].items[k].toString();
                        if (uu in userMainData)
                            userMainData[uu]+=1
                        else
                            userMainData[uu]=1;
                    }



                    if (req[1]==='start')
                    {




                        if (event.detail.data.response[i]===false || event.detail.data.response[i].count>1000000)
                        {
                            userGroups[groupPos]['failed'] = true;
                            userGroups[groupPos]['scanned'] = true;
                        }
                        else
                        {


                            if (event.detail.data.response[i].count<=1000)
                            {
                                userGroups[groupPos]['scanned'] = true;
                            }
                            else
                            {

                                let newOffsets = [];
                                let newIds = [];


                                for (let j=1;j*1000<event.detail.data.response[i].count;j++)
                                {





                                    //if (j>20)
                                    //    console.log(j,event.detail.data.response[i].count);
                                    newIds.push(groupsIds[i]);
                                    newOffsets.push(j*1000);
                                    if (j % 25 ===0 || (j+1)*1000>=event.detail.data.response[i].count)
                                    {


                                        apiGetMembersExecute('extra',newIds,newOffsets);
                                        newOffsets = [];
                                        newIds = [];
                                    }
                                }

                                //userGroups[groupPos]['scanned'] = true;
                            }


                        }



                    } else if (req[1]==='extra')
                    {

                        if (event.detail.data.response[i].count<=offsets[i]+1000)
                        {
                            userGroups[groupPos]['scanned'] = true;
                        }
                    }








                }


                let totalScanned = 0;
                for (let i= 0;i<userGroups.length;i++)
                    if (userGroups[i]['scanned'])
                        totalScanned+=1;



                console.log('progress '+totalScanned+'/'+userGroups.length);





                break;
        }
    }

    if (event.detail.type==="VKWebAppCallAPIMethodFailed")
    {


        apiFails+=1;
        let errorCode = event.detail.data.error_data.error_reason.error_code;
        console.log('FAIL '+errorCode+' '+event.detail.data.error_data.error_reason.error_msg);

        let req = event.detail.data.request_id.split('_');
        switch ( req[0] ) {

            /*case "getMembers":
                let group = req[1];

                if (errorCode===6)
                {

                    console.log('REPEAT '+group);
                    //setTimeout(function() {  }, TIME_DELAY);
                    apiGetMembers(group);
                }
                else
                {
                    console.log('STOP '+group);
                }

                break;*/

            case "getMembersExecute":

                let groupsIds = [];
                let offsets = [];
                for (let i=2;i<req.length;i+=2)
                {
                    groupsIds.push(Number(req[i]));
                    offsets.push(Number(req[i+1]));
                }



                //setTimeout(function() {   }, TIME_DELAY);
                apiGetMembersExecute(req[1],groupsIds,offsets);


                break;
        }
    }

}





send("VKWebAppInit", {});
send("VKWebAppGetAuthToken", {"app_id": 7691623,"scope":""});
subscribe(checker)




/*
sendId = function(userId)
{
    console.log(userId)
}


sendId(1000);*/



runFunction = function () {
    //console.log('test');
    let p = apiQueue.pop();
    if (p!==undefined)
    {
        console.log(p);
        console.log('API CALLS',apiCalls)
        console.log('API FAILS',apiFails)
        console.log('DICT SIZE ',Object.keys(userMainData).length);

        apiCalls+=1;


        send("VKWebAppCallAPIMethod", p);
    }


}

var t=setInterval(runFunction,TIME_DELAY);