$(function () {
    $('#TripEditor')
        .live('InitializeTripEditor', function () {
            var editor = $(this);
            editor.find('input[type=text].input-validation-error, textarea.input-validation-error').first().focus();
            editor.find('.Buttonset').buttonset();
        })
        .live('SaveTrip', function () {
            var editor = $(this);
            $.post(
                editor.find('form').attr('action'),
                editor.find('form').serialize(),
                function (data) {
                    editor.replaceWith($(data));
                    $('#TripEditor')
                        .trigger('InitializeTripEditor');
                }
            );
        });
    $('#TripEditor').trigger('InitializeTripEditor');
    $('.TripWidget')
        .live('InitializeTripWidget', function () {
            var widget = $(this);
            widget.find('.Edit').button({ icons: { primary: 'ui-icon-pencil'} });
            widget.find('.Remove')
                .click(function (event) {
                    event.preventDefault();
                    $.get($(this).attr('href'), null, function (data) {
                        var dialog = $(data);
                        dialog.dialog({
                            modal: true,
                            resizable: false,
                            closeOnEscape: false,
                            position: 'center',
                            width: 320,
                            buttons: {
                                'Remove': function (event, ui) {
                                    $.post(
                                        dialog.find('form').attr('action'),
                                        dialog.find('form').serialize(),
                                        function (data) {
                                            dialog.dialog('close');
                                            $('.TripWidget[data-tripid=' + data.TripId + ']').trigger('TripWidgetRemoved');
                                        });
                                },
                                'Cancel': function () {
                                    dialog.dialog('close');
                                }
                            },
                            close: function () {
                                dialog.dialog('destroy').remove();
                            }
                        });
                    });
                })
                .button({ icons: { primary: 'ui-icon-trash'} });
            widget.find('.View').button({ icons: { primary: 'ui-icon-search'} });
        });
    $('.TripWidget').trigger('InitializeTripWidget');
});

