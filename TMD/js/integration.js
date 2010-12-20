var integration = new function () {
    var public = {};

    public.init = function () {

        $('.datepicker').datepicker({
            showOn: 'button',
            buttonImage: '/images/icons/calendar.gif',
            duration: 0
        });

    }

    return public;
};
