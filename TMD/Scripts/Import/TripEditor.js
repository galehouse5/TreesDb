var TripEditor = new function () {
    var public = this;
    var isValidated = false;

    public.SaveAndChangeLocation = function (href) {
        $.put('Trip', $('.ImportTrip').find('form').serialize(), function (data) {
            isValidated = true;
            render(data);
            if ($('.ImportTrip').find('.field-validation-error').length == 0) {
                window.location.href = href;
            }
        });
    };

    var render = function (data) {
        if (data) {
            var newDom = $(data);
            $('.ImportTrip').replaceWith(newDom.find('.ImportTrip'));
        }
        $('#Trip_Date').datepicker({
            onClose: function () { $('#Trip_Date').focus(); }
        });
        $('input[type=text].input-validation-error, textarea.input-validation-error').first().focus();
        $('.measurer-add').button({ icons: { primary: 'ui-icon-circle-plus'} });
        $('.measurer-remove').button({ icons: { primary: 'ui-icon-trash'} });
        $('.EnterPublicAccess').buttonset();
    };

    public.Initialize = function () {
        render();
    };

    public.AddMeasurer = function () {
        $.post('CreateTripMeasurer',
            $('.treemeasurers input').serialize(),
            function (data) {
                var newDom = $(data);
                if (!isValidated) {
                    newDom.find('.field-validation-error').remove();
                }
                $('.treemeasurers').replaceWith(newDom.find('.treemeasurers'));
                $('.measurer-add').button({ icons: { primary: 'ui-icon-circle-plus'} });
                $('.measurer-remove').button({ icons: { primary: 'ui-icon-trash'} });
                $('.treemeasurers .treemeasurer').last().find('input').first().focus();
            });
    }

    public.RemoveMeasurer = function () {
        $.post('RemoveTripMeasurer',
            $('.treemeasurers input').serialize(),
            function (data) {
                var newDom = $(data);
                if (!isValidated) {
                    newDom.find('.field-validation-error').remove();
                }
                $('.treemeasurers').replaceWith(newDom.find('.treemeasurers'));
                $('.measurer-add').button({ icons: { primary: 'ui-icon-circle-plus'} });
                $('.measurer-remove').button({ icons: { primary: 'ui-icon-trash'} });
                $('.treemeasurers .treemeasurer').last().find('input').first().focus();
            });
    }
};

$(document).ready(function () {
    TripEditor.Initialize();
    $('a.import-navigation-forward').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).closest('a');
        TripEditor.SaveAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});