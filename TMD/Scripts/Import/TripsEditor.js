var TripsEditor = new function () {
    var render = function (data) {
        $('#TripsEditor').replaceWith($(data).find('#TripsEditor'));
        $('#TripsEditor .ImportAddTripButton').button();
        $('#TripsEditor .ImportEditButton').button({ icons: { primary: 'ui-icon-pencil'} });
        $('#TripsEditor .ImportRemoveButton').button({ icons: { primary: 'ui-icon-trash'} });
        $('#TripsEditor .ImportViewButton').button({ icons: { primary: 'ui-icon-search'} });
    };

    this.Refresh = function (refresh) {
        if (refresh) {
            $.get('/Import/Index', {}, function (data) {
                render(data);
            });
        }
    }
};

$(function () {
    $('#TripsEditor .ImportAddTripButton').button();
    $('#TripsEditor .ImportEditButton').button({ icons: { primary: 'ui-icon-pencil'} });
    $('#TripsEditor .ImportRemoveButton').button({ icons: { primary: 'ui-icon-trash'} });
    $('#TripsEditor .ImportViewButton').button({ icons: { primary: 'ui-icon-search'} });
});
