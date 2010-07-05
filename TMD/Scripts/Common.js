function TryParseFloat(str, defaultValue) {
    var retValue = defaultValue;
    if (str != null) {
        if (str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseFloat(str);
            }
        }
    }
    return retValue;
}

function IsFloatParsable(str) {
    if (str != null) {
        if (str.length > 0) {
            if (!isNaN(str)) {
                return true;
            }
        }
    }
    return false;
}

function IsNullOrEmpty(str) {
    if (str == null || str.length == 0) {
        return true;
    }
    return false;
}

function _ajax_request(url, data, callback, type, method) {
    if (jQuery.isFunction(data)) {
        callback = data;
        data = {};
    }
    return jQuery.ajax({
        type: method,
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
}

jQuery.extend({
    put: function (url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'PUT');
    },
    delete_: function (url, data, callback, type) {
        return _ajax_request(url, data, callback, type, 'DELETE');
    }
});

if (top.location != location) {
    top.location.href = document.location.href;
}

$(document).ready(function () {
    $('.noscript').hide();
    $('.hasscript').fadeIn();
    $.ajaxSetup({ cache: false });
});
