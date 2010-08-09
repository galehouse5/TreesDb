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
            onClose: function () { $('#Trip_Website').focus(); }
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

$(function () {
    TripEditor.Initialize();
    $('a.ImportNavigateForwards').click(function (eventObject) {
        var clickedAnchor = $(eventObject.target).closest('a');
        TripEditor.SaveAndChangeLocation(clickedAnchor.attr('href'));
        return false;
    });
});

var TripRemover = new function () {
    var isSaved;
    var closeCallback;

    var dom = $(
"<div id='TripRemover' title='Removing trip'>\
    <div class='Placeholder'></div>\
</div>");
    $(function () {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            position: 'center', width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } },
            close: dispose
        });
    });

    function dispose() {
        closeCallback(isSaved);
    }

    function render(data) {
        dom.find('.Placeholder').replaceWith($(data).find('.Placeholder'));
    }

    function remove() {
        $.delete_('/Import/Trip', {}, function (data) {
            isSaved = true;
            dom.dialog('close');
        });
    }

    this.Open = function (index, callback) {
        isSaved = false;
        closeCallback = callback;
        $.get('/Import/RemoveTrip', { tripIndex: index }, function (data) {
            render(data);
            dom.dialog('open');
        });
    };
};
