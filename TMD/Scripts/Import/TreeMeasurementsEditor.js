var TreeMeasurementsEditor = new function () {
    var isValidated = false;

    this.ValidateAndChangeLocation = function (href) {
        $.get('ValidateTreeMeasurements', {}, function (data) {
            isValidated = true;
            render(data);
            if ($('.treemeasurements-placeholder').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        $('.treemeasurements-placeholder').replaceWith(
            $(data).find('.treemeasurements-placeholder'));
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
    $('.wizard a.advance').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target);
        TreeMeasurementsEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});