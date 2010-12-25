var Integration = new function () {
    var public = {};

    public.Init = function () {

        $('body').live('ContentAdded', function () {

            $('.RequiresJavascript').show();

            slate.init();

            $('.datepicker').datepicker({
                showOn: 'button',
                buttonImage: '/images/icons/calendar.gif',
                duration: 0
            });

            $('.PhotoGallery').PhotoGallery();

        }).trigger('ContentAdded');

    }

    return public;
};
