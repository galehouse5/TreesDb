var TripEditor = new function () {
    var public = this;
    var validated = false;

    public.SaveAndChangeLocation = function (href) {
        $.put('Trip', $('.ui-placeholder-import-trip').find('form').serialize(), function (data) {
            validated = true;
            render(data);
            if ($('.ui-placeholder-import-trip').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        var newDom = $(data);
        $('.ui-placeholder-import-trip').replaceWith(newDom.find('.ui-placeholder-import-trip'));
        $('#Trip_Date').datepicker({
            onClose: function () { $('#Trip_Date').focus(); }
        });
        $('input[type=text].input-validation-error, textarea.input-validation-error').first().focus();
        $('.measurer-add').button({ icons: { primary: 'ui-icon-circle-plus'} });
        $('.measurer-remove').button({ icons: { primary: 'ui-icon-trash'} });
    };

    public.Initialize = function () {
        $('#Trip_Date').datepicker({
            onClose: function () { $('#Trip_Date').focus(); }
        });
        $('input[type=text], textarea').first().focus();
        $('.measurer-add').button({ icons: { primary: 'ui-icon-circle-plus'} });
        $('.measurer-remove').button({ icons: { primary: 'ui-icon-trash'} });
    };

    public.AddMeasurer = function () {
        $.post('CreateTripMeasurer',
            $('.treemeasurers input').serialize() + "&validate=" + validated.toString(), 
            function (data) {
                var newDom = $(data);
                $('.treemeasurers').replaceWith(newDom.find('.treemeasurers'));
                $('.measurer-add').button({ icons: { primary: 'ui-icon-circle-plus'} });
                $('.measurer-remove').button({ icons: { primary: 'ui-icon-trash'} });
                $('.treemeasurers .treemeasurer').last().find('input').first().focus();
        });
    }

    public.RemoveMeasurer = function () {
        $.post('RemoveTripMeasurer',
            $('.treemeasurers input').serialize() + "&validate=" + validated.toString(), 
            function (data) {
                var newDom = $(data);
                $('.treemeasurers').replaceWith(newDom.find('.treemeasurers'));
                $('.measurer-add').button({ icons: { primary: 'ui-icon-circle-plus'} });
                $('.measurer-remove').button({ icons: { primary: 'ui-icon-trash'} });
                $('.treemeasurers .treemeasurer').last().find('input').first().focus();
        });
    }
};

$(document).ready(function () {
    TripEditor.Initialize();
    $('a.ui-direction-import-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).closest('a');
        TripEditor.SaveAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});