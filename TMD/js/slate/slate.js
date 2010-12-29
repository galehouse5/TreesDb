var slate = {};

slate = function () {
    var pub = {};
    var self = {};
    var chartColors = ['#255648', '#FFB100', '#555', '#777', '#999', '#bbb', '#ccc', '#eee'];

    pub.init = function () {
        $('#search').not('.Initialized').addClass('Initialized').find('input').live('click', function () { $(this).val('') });
        $("form.form select, form.form input:checkbox, form.form input:radio, form.form input:file").not('.Initialized').addClass('Initialized').uniform();

        $('*[rel=datatable]').not('.Initialized').addClass('Initialized').dataTable();

        $("*[rel=tooltip]").not('.Initialized').addClass('Initialized').tipsy({ gravity: 's' });
        $("*[rel=facebox]").not('.Initialized').addClass('Initialized').facebox();

        $('table.stats').not('.Initialized').addClass('Initialized').each(function () {
            var chartType = '';

            if ($(this).attr('title')) {
                chartType = $(this).attr('title');
            }
            else {
                chartType = 'area';
            }

            var chart_width = $(this).parents('.portlet').width() * .85;

            $(this).hide().visualize({
                type: chartType, // 'bar', 'area', 'pie', 'line'
                width: chart_width,
                height: '240px',
                colors: chartColors
            });
        });
    }

    return pub;

} ();