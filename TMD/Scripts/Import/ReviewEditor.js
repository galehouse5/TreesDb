var ReviewEditor = new function () {
    this.ValidateAndChangeLocation = function (href) {
        $.get('Review', {}, function (data) {
            render(data);
            if ($('.ui-placeholder-import-sitevisits').find('.ui-validation-error .field-validation-error').not('.warning').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        $('.ui-placeholder-import-sitevisits').replaceWith(
            $(data).find('.ui-placeholder-import-sitevisits'));
        $('.ui-button-import-edit').button({ icons: { primary: 'ui-icon-pencil'} });
        $('.ui-button-import-remove').button({ icons: { primary: 'ui-icon-trash'} });
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
    $('a.ui-direction-import-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).parent();
        ReviewEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
    $('.ui-button-import-edit').button({ icons: { primary: 'ui-icon-pencil'} });
    $('.ui-button-import-remove').button({ icons: { primary: 'ui-icon-trash'} });
});