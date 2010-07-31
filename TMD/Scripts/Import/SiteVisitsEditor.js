var SiteVisitsEditor = new function () {
    var isValidated = false;

    this.ValidateAndChangeLocation = function (href) {
        $.get('ValidateSiteVisits', {}, function (data) {
            isValidated = true;
            render(data);
            if ($('.import-sitevisits').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        $('.import-sitevisits').replaceWith(
            $(data).find('.import-sitevisits'));
        $('.import-button-add-sitevisit').button();
        $('.import-button-edit').button({ icons: { primary: 'ui-icon-pencil'} });
        $('.import-button-remove').button({ icons: { primary: 'ui-icon-trash'} });
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
    $('a.import-navigation-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).closest('a');
        SiteVisitsEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
    $('.import-button-add-sitevisit').button();
    $('.import-button-edit').button({ icons: { primary: 'ui-icon-pencil'} });
    $('.import-button-remove').button({ icons: { primary: 'ui-icon-trash'} });
});
