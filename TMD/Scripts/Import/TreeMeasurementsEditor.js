var TreeMeasurementsEditor = new function () {
    var isValidated = false;

    this.ValidateAndChangeLocation = function (href) {
        $.get('ValidateTreeMeasurements', {}, function (data) {
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
        $('.import-button-add-treemeasurement').button();
        $('.import-button-edit').button({ icons: { primary: 'ui-icon-pencil'} });
        $('.import-button-remove').button({ icons: { primary: 'ui-icon-trash'} });
    };

    this.Refresh = function (refresh) {
        if (refresh) {
            if (isValidated) {
                $.get('ValidateTreeMeasurements', {}, function (data) {
                    render(data);
                });
            } else {
                $.get('TreeMeasurements', {}, function (data) {
                    render(data);
                });
            }
        }
    }
};

$(document).ready(function () {
    $('a.import-navigation-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).closest('a');
        TreeMeasurementsEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
    $('.import-button-add-treemeasurement').button();
    $('.import-button-edit').button({ icons: { primary: 'ui-icon-pencil'} });
    $('.import-button-remove').button({ icons: { primary: 'ui-icon-trash'} });
});