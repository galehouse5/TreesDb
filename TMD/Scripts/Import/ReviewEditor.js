var ReviewEditor = new function () {
    this.ValidateAndChangeLocation = function (href) {
        $.get('Review', {}, function (data) {
            render(data);
            if ($('.sitevisits-placeholder').find('.field-validation-error').not('.warning').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        $('.sitevisits-placeholder').replaceWith(
            $(data).find('.sitevisits-placeholder'));
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
    $('.wizard a.advance').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target);
        ReviewEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});