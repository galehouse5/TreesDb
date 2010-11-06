$(function () {
    var minutesBeforeTimeout;
    var warningTimer, timeoutTimer;
    $('body')
        .live('InitializeSessionTimeoutMonitor', function () {
            minutesBeforeTimeout = $('body').attr('data-sessiontimeout');
            warningTimer = setTimeout(
                function () { $('body').trigger('WarnSessionTimeout'); },
                Math.max(minutesBeforeTimeout - 5, 0) * 60000 + 1);
            timeoutTimer = setTimeout(
                function () { $('body').trigger('TimeoutSession'); },
                minutesBeforeTimeout * 60000);
        })
        .live('TimeoutSession', function () {
            $.post('/Account/TimeoutSession', {}, function () {
                window.location.href = '/Account/Logon';
            });
        })
        .live('RenewSessionTimeout', function () {
            $.post('/Account/RenewSessionTimeout', {}, function () {
                clearTimeout(warningTimer);
                clearTimeout(timeoutTimer);
                $('body').trigger('InitializeSessionTimeoutMonitor');
            });
        })
        .live('WarnSessionTimeout', function () {
            var dialog = $('<div><p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>Your session is about to time out.  Do you want to continue working?</p></div>');
            dialog.dialog({
                title: 'Continue working?',
                modal: true,
                resizable: false,
                closeOnEscape: false,
                position: 'center',
                width: 320,
                buttons: {
                    'Continue working': function () {
                        $('body').trigger('RenewSessionTimeout');
                        dialog.dialog('close');
                    },
                    'Log out': function () {
                        $('body').trigger('TimeoutSession');
                        dialog.dialog('close');
                    }
                },
                close: function () {
                    dialog.dialog('destroy').remove();
                }
            });
        });
    $('body').trigger('InitializeSessionTimeoutMonitor');
});

