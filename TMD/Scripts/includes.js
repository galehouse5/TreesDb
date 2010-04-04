function loadIncludes(scriptsDirectory, includeMaps) {
    includeJavascript(scriptsDirectory + "common.js");
    includeJavascript(scriptsDirectory + "ThirdParty/jquery.validate.min.js"); // http://bassistance.de/jquery-plugins/jquery-plugin-validation/ 
    if (includeMaps) {
        google.load("maps", "3", { other_params: "sensor=false" }); // google maps api v3
    }
}

function includeJavascript(src) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', src);
    head.appendChild(script);
};
