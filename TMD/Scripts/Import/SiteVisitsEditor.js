﻿var SiteVisitsEditor = new function () {
    var isValidated = false;

    this.ValidateAndChangeLocation = function (href) {
        $.get('ValidateSiteVisits', {}, function (data) {
            isValidated = true;
            render(data);
            if ($('.sitevisits-placeholder').find('.field-validation-error').length == 0) {
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
    $('.wizard a.advance').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target);
        SiteVisitsEditor.ValidateAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});