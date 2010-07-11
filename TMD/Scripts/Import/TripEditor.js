var TripEditor = new function () {
    this.SaveAndChangeLocation = function (href) {
        $.put('Trip', $('.ui-placeholder-import-trip').find('form').serialize(), function (data) {
            renderContent(data);
            if ($('.ui-placeholder-import-trip').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var renderContent = function (data) {
        var newDom = $(data);
        $('.ui-placeholder-import-trip').replaceWith(newDom.find('.ui-placeholder-import-trip'));
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
    $('a.ui-direction-import-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).parent();
        TripEditor.SaveAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});