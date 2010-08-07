$(function () {
    $('input[type=submit]').button();
    $('a.button').button();
    if ($('input[type=text].input-validation-error, input[type=password].input-validation-error').length > 0) {
        $('input[type=text].input-validation-error, input[type=password].input-validation-error').first().focus();
    } else {
        $('input[type=text]').first().focus();
    }
});
