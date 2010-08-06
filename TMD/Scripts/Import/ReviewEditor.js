var ReviewEditor = new function () {
    this.ValidateAndChangeLocation = function (href) {
        $.get('Review', {}, function (data) {
            render(data);
            if ($('.import-sitevisits').find('.ValidationError .field-validation-error').not('.warning').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        $('.import-sitevisits').replaceWith(
            $(data).find('.import-sitevisits'));
        $('.ImportEditButton').button({ icons: { primary: 'ui-icon-pencil'} });
        $('.ImportRemoveButton').button({ icons: { primary: 'ui-icon-trash'} });
    };

    this.Refresh = function (refresh) {
        if (refresh) {
            $.get('Review', {}, function (data) {
                render(data);
            });
        }
    }
};

$(document).ready(function () {
    $('a.import-navigation-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).closest('a');
        ReviewEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
    $('.ImportEditButton').button({ icons: { primary: 'ui-icon-pencil'} });
    $('.ImportRemoveButton').button({ icons: { primary: 'ui-icon-trash'} });
});