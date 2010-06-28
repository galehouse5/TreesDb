var importIconPaths = [
    "/Styles/Images/checked14.gif",
    "/Styles/Images/unchecked14.gif",
    "/Styles/Images/tree16.png",
    "/Styles/Images/tree32.png",
    "/Styles/Images/site16.png",
    "/Styles/Images/site32.png",
    "/Styles/Images/subsite16.png",
    "/Styles/Images/subsite32.png"];

$(document).ready(function () {
    // warm up import icons cache
    for (i in importIconPaths) {
        var importIcon = new Image();
        importIcon.src = importIconPaths[i];
    }
});