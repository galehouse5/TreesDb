$(function () {
    var advanceTrigger;
    $('.ImportAdvance')
        .click(function (event) {
            advanceTrigger = $(this);
            event.preventDefault();
            $('#TripEditor').trigger('SaveTrip');
        });
    $('#ImportStep')
        .bind('TripValidated', function () {
            window.location.href = advanceTrigger.attr('href');
        });
});