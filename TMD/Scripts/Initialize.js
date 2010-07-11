if (top.location != location) {
    top.location.href = document.location.href;
}

$(document).ready(function () {
    $('.ui-script-hide').hide();
    $('.ui-script-show').show();

    // resolves IE8 caching of get requests
    $.ajaxSetup({ cache: false });

    $('.ui-navigation').buttonset();
    $('.ui-navigation .ui-state-disable').addClass('ui-state-disabled');
    $('.ui-navigation .ui-state-activate').bind('mouseout', function (event, ui) {
        $('.ui-navigation .ui-state-activate').addClass('ui-state-active');
    });
    $('.ui-navigation .ui-state-activate').trigger('mouseout');

    $('.ui-account-login').button({ icons: { primary: 'ui-icon-unlocked'} });
    $('.ui-account-logout').button({ icons: { primary: 'ui-icon-locked'} });
});
