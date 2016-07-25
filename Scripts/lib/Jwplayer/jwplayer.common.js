jwplayer = jwplayer || {};
jwplayer.key = "tZ//T5InX+J2es3ml9gysj/5aAxxplJwp0AkOY+uqKg=";

window.mpcplayer = window.mpcplayer || {};
window.mpcplayer.getplayeroptions = function (isLive, url, height, width, imagepath, callback, isforceshowcontrol) {
    var flashpath = window.location.href + '/Scripts/lib/jwplayer/jwplayer.flash.swf';
    var html5path = window.location.href + '/Scripts/lib/jwplayer/jwplayer.html5.js';
    var isloadlatestplayer = true;
    var isedge = false;
    var stretchoption = 'uniform';
    if (getbrowserinfo().name.toLowerCase() == 'safari') {
        url = url.replace('/master.m3u8', '/playlist.m3u8');
        console.log("It is Safari");
    }
    if (getbrowserinfo().name.toLowerCase() == 'edge') {
        console.log("It is Edge");
        isedge = true;
    }

    if (isLive || isloadlatestplayer) {
        flashpath = window.location.href + '/Scripts/lib/jwplayer12/jwplayer.flash.swf';
        html5path = window.location.href + '/Scripts/lib/jwplayer12/jwplayer.html5.js';
    }
    if (imagepath == undefined || imagepath == null) {
        imagepath = "";
    }
    var isshowcontrol = !isLive;
    if (isforceshowcontrol != undefined && isforceshowcontrol != null) {
        isshowcontrol = isforceshowcontrol;
    }
    var playerOptions = {
        image: imagepath,
        file: url,
        flashplayer: flashpath,
        html5player: html5path,
        height: height,
        width: width,
        primary: isedge?"flash":"html5",
        provider: 'http',
        mute: false,
        controls: isshowcontrol,
        autostart: true,
        fallback: !isedge,
        stretching: stretchoption,
        stagevideo: false,
        plugins: {
            "ova-jw": {
                "ads": {
                    "pauseOnClickThrough": !isLive
                }
            }
        }
    };

    if (isLive || isloadlatestplayer) {
        $.getScript(window.location.href + '/Scripts/lib/jwplayer12/jwplayer.js', function () {
            if (callback)
                callback(playerOptions);
        });
    }
    else {
        $.getScript(window.location.href + '/Scripts/lib/jwplayer/jwplayer.js', function () {
            if (callback)
                callback(playerOptions);
        });
    }

    getbrowserinfo = function () {
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|edge|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/edge/i.test(ua)) {
            M = ua.match(/(edge(?=\/))\/?\s*(\d+)/i) || [];
        }
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/)
            if (tem != null) { return { name: 'Opera', version: tem[1] }; }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
        return {
            name: M[0],
            version: M[1]
        };
    }
};