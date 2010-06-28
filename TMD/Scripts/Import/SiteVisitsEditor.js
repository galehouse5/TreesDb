var SiteVisitsEditor = new function () {
    var states = { normal: 0x0, validated: 0x1 };
    var state = states.normal;

    this.ValidateAndChangeLocation = function (href) {
        $.get('ValidateSiteVisits', {}, function (data) {
            state = states.validated;
            renderPlaceholder(data);
            if ($('.sitevisits-placeholder').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var renderPlaceholder = function (data) {
        var newDom = $(data);
        $('.sitevisits-placeholder').replaceWith(newDom.find('.sitevisits-placeholder'));
    };

    this.Refresh = function () {
        if (state == states.validated) {
            $.get('ValidateSiteVisits', {}, function (data) {
                renderPlaceholder(data);
            });
        } else {
            $.get('SiteVisits', {}, function (data) {
                renderPlaceholder(data);
            });
        }
    }
};

$(document).ready(function () {
    $('.wizard a.advance').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target);
        SiteVisitsEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});