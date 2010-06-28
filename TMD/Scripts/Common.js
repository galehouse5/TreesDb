if (top.location != location) {
    top.location.href = document.location.href;
}

$(document).ready(function () {
    $('.noscript').hide();
    $('.hasscript').fadeIn();
    $.ajaxSetup({ cache: false });
});