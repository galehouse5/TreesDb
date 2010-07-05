var TreeMeasurementEditor = new function () {
    var public = this;
    var dom = $(
            "<div id='treemeasurement-editor' class='dialog'>\
                <div class='accordion'>\
                    <h3 class='general-placeholder'></h3>\
                    <div class='general-placeholder'></div>\
                    <h3 class='heightandgirth-placeholder'></h3>\
                    <div class='heightandgirth-placeholder'></div>\
                    <h3 class='trunkandcrown-placeholder'></h3>\
                    <div class='trunkandcrown-placeholder'></div>\
                    <h3 class='misc-placeholder'></h3>\
                    <div class='misc-placeholder'></div>\
                </div>\
            </div>");
    var isSaved, isAdding;
    var closeCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, width: 768, height: 'auto', minHeight: 600,
            buttons: { 'Save': save, 'Cancel': function () { dom.dialog('close'); } }
        });
        if (isAdding) {
            dom.dialog({ title: 'Add tree measurement' });
        } else {
            dom.dialog({ title: 'Edit tree measurement' });
        }
        dom.find('.accordion').accordion({ fillSpace: true, animated: false, active: 0 });
        dom.bind('dialogclose', dispose);
    }

    function dispose() {
        if (isAdding && !isSaved) {
            $.delete_('TreeMeasurement');
        }
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    function render(data) {
        var newDom = $(data);
        dom.find('h3.general-placeholder').html(newDom.find('h3.general-placeholder').html());
        dom.find('div.general-placeholder').html(newDom.find('div.general-placeholder').html());
        dom.find('h3.heightandgirth-placeholder').html(newDom.find('h3.heightandgirth-placeholder').html());
        dom.find('div.heightandgirth-placeholder').html(newDom.find('div.heightandgirth-placeholder').html());
        dom.find('h3.trunkandcrown-placeholder').html(newDom.find('h3.trunkandcrown-placeholder').html());
        dom.find('div.trunkandcrown-placeholder').html(newDom.find('div.trunkandcrown-placeholder').html());
        dom.find('h3.misc-placeholder').html(newDom.find('h3.misc-placeholder').html());
        dom.find('div.misc-placeholder').html(newDom.find('div.misc-placeholder').html());
        dom.find('.coordinates-entered-selector input').bind('change', (function () {
            dom.find('.coordinates-entered-selector input').attr('checked') ?
                    dom.find('.coordinates-entered-visible').show() :
                    dom.find('.coordinates-entered-visible').hide();
        }));
        dom.find('.coordinates-entered-selector input').trigger('change');
        dom.find('.accordion').accordion('resize');
    }

    function validate() {
        if (dom.find('.general-placeholder .field-validation-error').length > 0) {
            dom.find('.accordion').accordion('activate', 0);
            dom.find('.general-placeholder .input-validation-error').first().focus();
            return false;
        } else if (dom.find('.heightandgirth-placeholder .field-validation-error').length > 0) {
            dom.find('.accordion').accordion('activate', 1);
            dom.find('.heightandgirth-placeholder .input-validation-error').first().focus();
            return false;
        } else if (dom.find('.trunkandcrown-placeholder .field-validation-error').length > 0) {
            dom.find('.accordion').accordion('activate', 2);
            dom.find('.trunkandcrown-placeholder .input-validation-error').first().focus();
            return false;
        } else if (dom.find('.misc-placeholder .field-validation-error').length > 0) {
            dom.find('.accordion').accordion('activate', 3);
            dom.find('.misc-placeholder .input-validation-error').first().focus();
            return false;
        }
        return true;
    }

    function save() {
        $.put('TreeMeasurement', dom.find('form').serialize(), function (data) {
            render(data);
            if (validate()) {
                isSaved = true;
                dom.dialog('close');
            }
        });
    }

    public.Add = function (siteVisitIndex, subsiteVisitIndex, callback) {
        isAdding = true;
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.post('CreateTreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex }, function (data) {
            dom.dialog('open');
            render(data);
        });
    };

    public.Edit = function (siteVisitIndex, subsiteVisitIndex, treeMeasurementIndex, callback) {
        isAdding = false;
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.get('TreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex, treeMeasurementIndex: treeMeasurementIndex }, function (data) {
            dom.dialog('open');
            render(data);
        });
    };

    public.Show = function () {
        dom.bind('dialogclose', dispose);
        dom.dialog('open');
    };

    public.Hide = function () {
        dom.unbind('dialogclose');
        dom.dialog('close');
    };

    public.OpenCoordinatePicker = function () {
        function coordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    dom.find('input.treemeasurement-latitude').val(newCoordinates.Latitude);
                    dom.find('input.treemeasurement-longitude').val(newCoordinates.Longitude);
                } else {
                    dom.find('input.treemeasurement-latitude').val(result.latitude);
                    dom.find('input.treemeasurement-longitude').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedTreeMeasurement', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('input.treemeasurement-latitude').val(),
            dom.find('input.treemeasurement-longitude').val());
        var options = { markerLoader: loadMapMarkers };
        if (coordinates.IsSpecified) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        }
        CoordinatePicker.Open(options, coordinatePickerClosed);
    };
};

var TreeMeasurementRemover = new function () {
    var dom = $(
        "<div id='treemeasurement-editor' class='dialog'>\
            <div class='treemeasurement-placeholder'>\
            </div>\
        </div>");
    var isSaved;
    var closeCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 480, height: 160, title: 'Remove tree measurement',
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } }
        });
        dom.bind('dialogclose', dispose);
    }

    function dispose() {
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    function render(data) {
        dom.find('.treemeasurement-placeholder').replaceWith($(data));
    }

    function remove() {
        $.delete_('TreeMeasurement', {}, function (data) {
            isSaved = true;
            dom.dialog('close');
        });
    }

    this.Open = function (siteVisitIndex, subsiteVisitIndex, treeMeasurementIndex, callback) {
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.get('RemoveTreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex, treeMeasurementIndex: treeMeasurementIndex }, function (data) {
            dom.dialog('open');
            render(data);
        });
    };
};
