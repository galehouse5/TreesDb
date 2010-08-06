var TrunkMeasurementEditor = new function () {
    var public = this;
    var isSaved, isAdding;
    var closeCallback;

    var editor;
    $(document).ready(function () {
        editor = $("<div id='TrunkMeasurementEditor'>\
            <div class='Placeholder'></div>\
        </div>")
            .dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
                width: 405, position: 'center',
                buttons: { 'Save': save, 'Cancel': function () { $('#TrunkMeasurementEditor').dialog('close'); } }
            })
            .bind('dialogclose', dispose);
    });

    function dispose() {
        editor.find('.Placeholder').empty();
        if (isAdding && !isSaved) {
            $.delete_('TrunkMeasurement');
        }
        closeCallback(isSaved);
    }

    function render(data) {
        editor.find('.Placeholder').replaceWith($(data));
        editor.find('.EnterDistanceAndAngleMeasurements input')
            .bind('change', (function () {
                if (editor.find('.EnterDistanceAndAngleMeasurements input').attr('checked')) {
                    editor.find('.DistanceAndAngleMeasurementsEntered').show();
                    editor.find('.DistanceAndAngleMeasurementsEntered input').first().focus();
                } else {
                    editor.find('.DistanceAndAngleMeasurementsEntered').hide();
                }
            })).trigger('change').button();
        editor.find('.CalculateHeightAndOffset').button({ icons: { primary: 'ui-icon-calculator'} });
    }

    function validate() {
        if (editor.find('.field-validation-error').length > 0) {
            editor.find('.input-validation-error').first().focus();
            return false;
        }
        return true;
    }

    function save() {
        $.put('TrunkMeasurement', editor.find('form').serialize(), function (data) {
            render(data);
            if (validate()) {
                isSaved = true;
                editor.dialog('close');
            }
        });
    }

    public.Add = function (options) {
        isAdding = true;
        isSaved = false;
        closeCallback = options.onClose;
        editor.dialog('option', { title: 'Adding trunk measurement' });
        $.post('CreateTrunkMeasurement', {}, function (data) {
            render(data);
            editor.dialog('open').find('input').first().focus();
        });
    }

    public.Edit = function (index, options) {
        isAdding = false;
        isSaved = false;
        closeCallback = options.onClose;
        editor.dialog('option', { title: 'Editing trunk measurement' });
        $.get('TrunkMeasurement', { trunkMeasurementIndex: index }, function (data) {
            render(data);
            editor.dialog('open').find('input').first().focus();
        });
    }

    public.CalculateDetailedHeightMeasurements = function () {
        $.put('TrunkMeasurement', editor.find('form').serialize(), function (data) {
            render(data);
        });
    }
};

var TrunkMeasurementRemover = new function () {
    var isSaved;
    var closeCallback;

    var dialog;
    $(document).ready(function () {
        dialog = $("<div id='TrunkMeasurementRemover' title='Removing trunk measurement'>\
            <div class='Placeholder'></div>\
        </div>")
            .dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
                position: 'center', width: 320,
                buttons: { 'Remove': remove, 'Cancel': function () { $('#TrunkMeasurementRemover').dialog('close'); } },
                close: dispose
            });
    });

    var dispose = function () {
        dialog.unbind('dialogclose');
        closeCallback(isSaved);
    }

    var render = function (data) {
        dialog.find('.Placeholder').replaceWith($(data));
    }

    var remove = function () {
        $.delete_('TrunkMeasurement', {}, function (data) {
            isSaved = true;
            dialog.dialog('close');
        });
    }

    this.Open = function (index, options) {
        isSaved = false;
        closeCallback = options.onClose;
        $.get('RemoveTrunkMeasurement', { trunkMeasurementIndex: index }, function (data) {
            render(data);
            dialog.dialog('open');
        });
    }
};
