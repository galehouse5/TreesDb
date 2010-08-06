$(document).ready(function () {
    $('.ImportNavigationMiddle').buttonset();
    $('.ImportNavigationMiddle .ui-state-disable').addClass('ui-state-disabled');
    $('.ImportNavigationMiddle .ui-state-activate').bind('mouseout', function (event, ui) {
        $('.ImportNavigationMiddle .ui-state-activate').addClass('ui-state-active');
    });
    $('.ImportNavigationMiddle .ui-state-activate').trigger('mouseout');

    $('.ImportNavigationRight a').button({ icons: { primary: 'ui-icon ui-icon-carat-1-e', secondary: 'ui-icon ui-icon-carat-1-e'} });
    $('.ImportNavigationLeft a').button({ icons: { primary: 'ui-icon ui-icon-carat-1-w', secondary: 'ui-icon ui-icon-carat-1-w'} });
});