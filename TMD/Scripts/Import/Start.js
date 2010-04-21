var importIconPaths = [
    "/Styles/Images/checked.gif",
    "/Styles/Images/unchecked.gif",
    "/Styles/Images/tree.png",
    "/Styles/Images/site.png",
    "/Styles/Images/subsite.png",
    "/Styles/ThirdParty/smoothness/images/ui-bg_glass_75_e6e6e6_1x400.png"];

function PreloadImportIcons() {
    for (i in importIconPaths) {
        var importIcon = new Image();
        importIcon.src = importIconPaths[i];
    }
}

$(document).ready(function () {
    PreloadImportIcons();
});