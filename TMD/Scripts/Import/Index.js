$(function () {
    $('.TripWidgetContainer')
        .live('InitializeTripWidgetContainer', function () {
            var widgetContainer = $(this);
            widgetContainer.find('.Add').button();
            widgetContainer.find('.Edit').button({ icons: { primary: 'ui-icon-pencil'} });
        })
        .live('TripWidgetRemoved', function () {
            var widgetContainer = $(this);
            $.get('/Import/Index', {}, function (data) {
                widgetContainer.replaceWith($(data).find('.TripWidgetContainer'));
                widgetContainer.trigger('InitializeTripWidgetContainer');
                widgetContainer.find('.TripWidget')
                        .trigger('InitializeTripWidget');
            });
        });
    $('.TripWidgetContainer').trigger('InitializeTripWidgetContainer');
});
