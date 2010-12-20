var Integration = new function () {
    var public = {};

    public.Init = function () {

        $('.datepicker').datepicker({
            showOn: 'button',
            buttonImage: '/images/icons/calendar.gif',
            duration: 0
        });

    }

    return public;
};
