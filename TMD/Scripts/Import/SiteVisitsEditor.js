var SiteVisitsEditor = new function () {
    var isValidated = false;

    this.ValidateAndChangeLocation = function (href) {
        $.get('ValidateSiteVisits', {}, function (data) {
            isValidated = true;
            render(data);
            if ($('.ui-placeholder-import-sitevisits').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        $('.ui-placeholder-import-sitevisits').replaceWith(
            $(data).find('.ui-placeholder-import-sitevisits'));
        $('.ui-button-import-add-sitevisit').button();
        $('.ui-button-import-edit').button({ icons: { primary: 'ui-icon-pencil'} });
        $('.ui-button-import-remove').button({ icons: { primary: 'ui-icon-trash'} });
    };

    this.Refresh = function (refresh) {
        if (refresh) {
            if (isValidated) {
                $.get('ValidateSiteVisits', {}, function (data) {
                    render(data);
                });
            } else {
                $.get('SiteVisits', {}, function (data) {
                    render(data);
                });
            }
        }
    }
};

$(document).ready(function () {
    $('a.ui-direction-import-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).closest('a');
        SiteVisitsEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
    $('.ui-button-import-add-sitevisit').button();
    $('.ui-button-import-edit').button({ icons: { primary: 'ui-icon-pencil'} });
    $('.ui-button-import-remove').button({ icons: { primary: 'ui-icon-trash'} });
});
