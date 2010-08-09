var ReviewEditor = new function () {
    this.ValidateAndFinishImport = function (submittedForm) {
        $.get('Review', {}, function (data) {
            render(data);
            if ($('.import-sitevisits').find('.ValidationError .field-validation-error').not('.warning').length == 0) {
                submittedForm.submit();
            }
        });
    };

    var render = function (data) {
        $('.import-sitevisits').replaceWith(
            $(data).find('.import-sitevisits'));
        $('.ImportEditButton').button({ icons: { primary: 'ui-icon-pencil'} });
        $('.ImportRemoveButton').button({ icons: { primary: 'ui-icon-trash'} });
    };

    this.Refresh = function (refresh) {
        if (refresh) {
            $.get('Review', {}, function (data) {
                render(data);
            });
        }
    }
};

$(function () {
    $('button.ImportNavigateForwards').click(function (eventObject) {
        var submittedForm = $(eventObject.target).closest('form');
        ReviewEditor.ValidateAndFinishImport(submittedForm);
        return false;
    });
    $('.ImportEditButton').button({ icons: { primary: 'ui-icon-pencil'} });
    $('.ImportRemoveButton').button({ icons: { primary: 'ui-icon-trash'} });
});