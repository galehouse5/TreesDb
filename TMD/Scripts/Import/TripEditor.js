var TripEditor = new function () {
    this.SaveAndChangeLocation = function (href) {
        $.put('Trip', $('.trip-placeholder').find('form').serialize(), function (data) {
            renderPlaceholder(data);
            if ($('.trip-placeholder').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var renderPlaceholder = function (data) {
        var newDom = $(data);
        $('.trip-placeholder').replaceWith(newDom.find('.trip-placeholder'));
        $('#Trip_Date').datepicker({
            onClose: function () { $('#Trip_Date').focus(); }
        });
        $('input[type=text].input-validation-error, textarea.input-validation-error').first().focus();
    };

    this.Initialize = function () {
        $('#Trip_Date').datepicker({
            onClose: function () { $('#Trip_Date').focus(); }
        });
        $('input[type=text], textarea').first().focus();
    };
};

$(document).ready(function () {
    TripEditor.Initialize();
    $('.wizard a.advance').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target);
        TripEditor.SaveAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});