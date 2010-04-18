$(document).ready(function () {
    $('.noscript').hide();
    $('.hasscript').fadeIn();
});

function CreateDatepicker(element) {
    $(element).datepicker({
        minDate: '01/01/1753',
        maxDate: '01/01/9999',
        constrainInput: true
    });
}
