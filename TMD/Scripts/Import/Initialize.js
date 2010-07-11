$(document).ready(function () {
    $('.ui-navigation-import-middle').buttonset();
    $('.ui-navigation-import-middle .ui-state-disable').addClass('ui-state-disabled');
    $('.ui-navigation-import-middle .ui-state-activate').bind('mouseout', function (event, ui) {
        $('.ui-navigation-import-middle .ui-state-activate').addClass('ui-state-active');
    });
    $('.ui-navigation-import-middle .ui-state-activate').trigger('mouseout');

    $('.ui-navigation-import-right a').button({ icons: { primary: 'ui-icon ui-icon-carat-1-e', secondary: 'ui-icon ui-icon-carat-1-e'} });
    $('.ui-navigation-import-left a').button({ icons: { primary: 'ui-icon ui-icon-carat-1-w', secondary: 'ui-icon ui-icon-carat-1-w'} });
});