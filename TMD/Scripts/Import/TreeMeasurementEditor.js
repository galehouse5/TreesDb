var TreeMeasurementEditor = new function () {
    var public = this;
    var dom = $(
"<div>\
    <form>\
        <div class='tabs'>\
            <ul>\
                <li><a href='#editor-treemeasurement-general' class='placeholder-general'>General</a></li>\
                <li><a href='#editor-treemeasurement-height' class='placeholder-height'>Height</a></li>\
                <li><a href='#editor-treemeasurement-girth' class='placeholder-girth'>Girth</a></li>\
                <li><a href='#editor-treemeasurement-trunk' class='placeholder-trunk'>Trunk</a></li>\
                <li><a href='#editor-treemeasurement-crown' class='placeholder-crown'>Crown</a></li>\
                <li><a href='#editor-treemeasurement-status' class='placeholder-status'>Status</a></li>\
                <li><a href='#editor-treemeasurement-misc' class='placeholder-misc'>Misc</a></li>\
            </ul>\
            <div id='editor-treemeasurement-general' class='placeholder-general'></div>\
            <div id='editor-treemeasurement-height' class='placeholder-height'></div>\
            <div id='editor-treemeasurement-girth' class='placeholder-girth'></div>\
            <div id='editor-treemeasurement-trunk' class='placeholder-trunk'></div>\
            <div id='editor-treemeasurement-crown' class='placeholder-crown'></div>\
            <div id='editor-treemeasurement-status' class='placeholder-status'></div>\
            <div id='editor-treemeasurement-misc' class='placeholder-misc'></div>\
        </div>\
    </form>\
</div>");
    var isSaved, isAdding;
    var closeCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, width: 440,
            buttons: { 'Save': save, 'Cancel': function () { dom.dialog('close'); } }
        });
        if (isAdding) {
            dom.dialog({ title: 'Adding tree measurement' });
        } else {
            dom.dialog({ title: 'Editing tree measurement' });
        }
        dom.find('.tabs').tabs({ selected: 0 }).bind('tabsselect', function () {
            setTimeout(focusFirstVisibleErrorOrInput, 1);
        });
        dom.bind('dialogclose', dispose);
    }

    function focusFirstVisibleErrorOrInput() {
        switch (dom.find('.tabs').tabs('option', 'selected')) {
            case 0:
                if (dom.find('div.placeholder-general .input-validation-error').length > 0) {
                    dom.find('div.placeholder-general .input-validation-error').first().focus();
                } else {
                    dom.find('div.placeholder-general input').first().focus();
                }
                break;
            case 1:
                if (dom.find('div.placeholder-height .input-validation-error').length > 0) {
                    dom.find('div.placeholder-height .input-validation-error').first().focus();
                } else {
                    dom.find('div.placeholder-height input').first().focus();
                }
                break;
            case 2:
                if (dom.find('div.placeholder-girth .input-validation-error').length > 0) {
                    dom.find('div.placeholder-girth .input-validation-error').first().focus();
                } else {
                    dom.find('div.placeholder-girth input').first().focus();
                }
                break;
            case 3:
                if (dom.find('div.placeholder-trunk .input-validation-error').length > 0) {
                    dom.find('div.placeholder-trunk .input-validation-error').first().focus();
                } else {
                    dom.find('div.placeholder-trunk input').first().focus();
                }
                break;
            case 4:
                if (dom.find('div.placeholder-crown .input-validation-error').length > 0) {
                    dom.find('div.placeholder-crown .input-validation-error').first().focus();
                } else {
                    dom.find('div.placeholder-crown input').first().focus();
                }
                break;
            case 5:
                if (dom.find('div.placeholder-status .input-validation-error').length > 0) {
                    dom.find('div.placeholder-status .input-validation-error').first().focus();
                } else {
                    dom.find('div.placeholder-status input').first().focus();
                }
                break;
            case 6:
                if (dom.find('div.placeholder-misc .input-validation-error').length > 0) {
                    dom.find('div.placeholder-misc .input-validation-error').first().focus();
                } else {
                    dom.find('div.placeholder-misc input').first().focus();
                }
                break;
        }
    }

    function dispose() {
        if (isAdding && !isSaved) {
            $.delete_('TreeMeasurement');
        }
        dom.find('.tabs').unbind('tabsselect');
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    function render(data) {
        var newDom = $(data);
        dom.find('div.placeholder-general').html(newDom.find('div.placeholder-general').html());
        dom.find('div.placeholder-height').html(newDom.find('div.placeholder-height').html());
        dom.find('div.placeholder-girth').html(newDom.find('div.placeholder-girth').html());
        dom.find('div.placeholder-trunk').html(newDom.find('div.placeholder-trunk').html());
        dom.find('div.placeholder-crown').html(newDom.find('div.placeholder-crown').html());
        dom.find('div.placeholder-status').html(newDom.find('div.placeholder-status').html());
        dom.find('div.placeholder-misc').html(newDom.find('div.placeholder-misc').html());
        dom.find('.coordinates-entered input').bind('change', (function () {
            dom.find('.coordinates-entered input').attr('checked') ?
                    dom.find('.coordinates-entered-visible').show() :
                    dom.find('.coordinates-entered-visible').hide();
        }));
        dom.find('.coordinates-entered input').trigger('change');
        dom.find('.treename-entered input').bind('change', (function () {
            dom.find('.treename-entered input').attr('checked') ?
                    dom.find('.treename-entered-visible').show() :
                    dom.find('.treename-entered-visible').hide();
        }));
        dom.find('.treename-entered input').trigger('change');
        dom.find('.measured input').datepicker({ onClose: function () { dom.find('.measured input').focus(); } });
        dom.find('.common-name input').autocomplete({ source: "AutocompleteCommonName", minLength: 2, select: function (event, ui) {
            dom.find('.scientific-name input').val(ui.item.scientificName);
        } 
        });
        dom.find('.coordinate-picker').button({ icons: { primary: 'ui-icon-circle-zoomout'} });
        dom.find('.height-detailed input').bind('change', (function () {
            if (dom.find('.height-detailed input').attr('checked')) {
                dom.find('.height-detailed-visible').hide();
                dom.find('.height-simple-visible').show();
            } else {

                dom.find('.height-simple-visible').hide();
                dom.find('.height-detailed-visible').show();
            }
        }));
        dom.find('.height-detailed input').trigger('change');
        dom.find('.height-detailed').buttonset();
        dom.find('.height-detailed-calculate').button({ icons: { primary: 'ui-icon-calculator'} });
    }

    function validate() {
        var tabsWithErrors = new Array();
        if (dom.find('.placeholder-general .input-validation-error').length > 0) {
            tabsWithErrors.push(0);
        }
        if (dom.find('.placeholder-height .input-validation-error').length > 0) {
            tabsWithErrors.push(1);
        }
        if (dom.find('.placeholder-girth .input-validation-error').length > 0) {
            tabsWithErrors.push(2);
        }
        if (dom.find('.placeholder-trunk .input-validation-error').length > 0) {
            tabsWithErrors.push(3);
        }
        if (dom.find('.placeholder-crown .input-validation-error').length > 0) {
            tabsWithErrors.push(4);
        }
        if (dom.find('.placeholder-status .input-validation-error').length > 0) {
            tabsWithErrors.push(5);
        }
        if (dom.find('.placeholder-misc .input-validation-error').length > 0) {
            tabsWithErrors.push(6);
        }
        if (tabsWithErrors.length > 0) {
            var currentlySelectedTab = dom.find('.tabs').tabs('option', 'selected');
            var tabWithError;
            while (tabsWithErrors.length > 0) {
                tabWithError = tabsWithErrors.pop();
                if (tabWithError == currentlySelectedTab) {
                    focusFirstVisibleErrorOrInput();
                    return false;
                }
            }
            dom.find('.tabs').tabs('select', tabWithError);
            return false;
        } else {
            return true;
        }
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

    public.CalculateDetailedHeightMeasurements = function () {
        $.put('TreeMeasurement', dom.find('form').serialize(), function (data) {
            render(data);
        });
    }

    public.Add = function (siteVisitIndex, subsiteVisitIndex, callback) {
        isAdding = true;
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.post('CreateTreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex }, function (data) {
            render(data);
            dom.dialog('open');
            setTimeout(function () { dom.find('input').first().focus(); }, 1);
        });
    };

    public.Edit = function (siteVisitIndex, subsiteVisitIndex, treeMeasurementIndex, callback) {
        isAdding = false;
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.get('TreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex, treeMeasurementIndex: treeMeasurementIndex }, function (data) {
            render(data);
            dom.dialog('open');
            setTimeout(function () { dom.find('input').first().focus(); }, 1);
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
                    dom.find('.latitude input').val(newCoordinates.Latitude);
                    dom.find('.longitude input').val(newCoordinates.Longitude);
                } else {
                    dom.find('.latitude input').val(result.latitude);
                    dom.find('.longitude input').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedTreeMeasurement', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('.latitude input').val(),
            dom.find('.longitude input').val());
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
"<div title='Removing tree measurement'>\
    <div class='placeholder'>\
    </div>\
</div>");
    var isSaved;
    var closeCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } }
        });
        dom.bind('dialogclose', dispose);
    }

    function dispose() {
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    function render(data) {
        dom.find('.placeholder').replaceWith($(data));
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
            render(data);
            dom.dialog('open');
        });
    };
};
