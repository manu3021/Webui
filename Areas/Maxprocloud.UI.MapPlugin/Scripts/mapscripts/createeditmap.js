
window.mapconfig.mapInitializer = (function ($, mapcontext, document, common) {
   // var instance;

    //image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
    //var utility = window.mapconfig.utility.getinstance();

    function loadScript() {
        var scriptRichmarker = document.createElement('script');
        scriptRichmarker.type = 'text/javascript'; 
        scriptRichmarker.src = window.location.href + '/Scripts/mapscripts/richmarker.js';
        document.body.appendChild(scriptRichmarker);
    }

    function startlocalops(data) {
        window.mapconfig.map = data;
        console.log("window.mapconfig.map", window.mapconfig.map);
        loadScript();
        window.mapconfig.mapcontext.showmarker();
    }
    function Initialize() {
        //if (window.mapconfig.mapcontext.isInitialized) {
        //    return;
        //}
        //window.mapconfig.mapcontext.isInitialized = true;

        $("#map-canvas").css({ 'width': '100%', 'height': '100%' });
        window.mapconfig = window.mapconfig || {};
        window.mapconfig.map = null;

        window.googleMaps().init(function (data) {
            data.Name = "CreateView";
            startlocalops(data);
        }, document.getElementById('map-canvas'));
    };

    function onzoomlevelchanged(event, data) {
        if (!window.mapconfig.mapcontext.isInitialized) return;
        var zoomValue = window.mapconfig.map.getZoom();
        mapcontext.onmapzoomchanged(zoomValue);
    }



    Initialize();
})($, window.mapconfig.mapcontext, document, window.mapconfig.common);

