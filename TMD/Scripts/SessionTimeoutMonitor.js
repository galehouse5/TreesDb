var SessionTimeoutMonitor = new function () {
    var minutesBeforeTimeout;
    var warningTimer, timeoutTimer;
    var dialog;

    $(function () {
        dialog = $('<div id="SessionTimeoutMonitor" title="Continue working?">\
            <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>Your session is about to time out.  Do you want to continue working?</p>\
        </div>')
            .dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
                position: 'center', width: 320,
                buttons: { 'Continue working': continueWorking, 'Log out': timeoutSession },
            })
            .bind('dialogclose', continueWorking);
        minutesBeforeTimeout = $('body').attr('data-sessiontimeout');
        setTimeoutTimers();
    });

    function setTimeoutTimers() {
        warningTimer = setTimeout(warnOfSessionTimeout, Math.max(minutesBeforeTimeout - 5, 0) * 60000 + 1);
        timeoutTimer = setTimeout(timeoutSession, minutesBeforeTimeout * 60000);
    };

    function clearTimeoutTimers() {
        clearTimeout(warningTimer);
        clearTimeout(timeoutTimer);
    };

    function timeoutSession() {
        $.post('/Account/TimeoutSession', {}, function() {
            window.location.href = '/Account/Login';
        });
    };

    function warnOfSessionTimeout() {
        dialog.dialog('open');
    };

    function continueWorking() {
        $.get('/Account/RenewSessionTimeout', {}, function() {
            clearTimeoutTimers();
            setTimeoutTimers();
            dialog
                .unbind('dialogclose')
                .dialog('close')
                .bind('dialogclose', continueWorking);
        });
    };
};

