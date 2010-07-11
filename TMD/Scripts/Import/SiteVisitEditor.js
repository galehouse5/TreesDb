var SiteVisitEditor = new function () {
    var public = this;
    var dom = $(
            "<div id='sitevisit-editor' class='dialog'>\
                <div class='accordion'>\
                    <h3 class='sitevisit-placeholder'></h3>\
                    <div class='sitevisit-placeholder'></div>\
                    <h3 class='subsitevisits-placeholder'></h3>\
                    <div class='subsitevisits-placeholder'></div>\
                </div>\
            </div>");
    var isSaved, isAdding, isValidating, isSubsiteAddingDisabled;
    var closeCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, width: 640, height: 'auto', minHeight: 560,
            buttons: { 'Save': save, 'Cancel': function () { dom.dialog('close'); } }
        });
        if (isAdding) {
            dom.dialog({ title: 'Add site visit' });
        } else {
            dom.dialog({ title: 'Edit site visit' });
        }
        dom.find('.accordion').accordion({ fillSpace: true, animated: false, active: 0 });
        dom.find('.accordion').bind('accordionchange', changeStep);
        dom.bind('dialogclose', dispose);
    }

    function changeStep(event, ui) {
        if (ui.options.active == 0) {
            if (!isValidating) {
                setTimeout(function () { dom.find('div.sitevisit-placeholder input').first().focus(); }, 1);
            }
        } else if (ui.options.active == 1) {
            var newSerializedDom = dom.find('form').serialize();
            if (serializedDom != newSerializedDom) {
                serializedDom = newSerializedDom;
                $.put('SiteVisit', dom.find('form').serialize(), function (data) {
                    render(data, true);
                });
            }
        }
    }

    function dispose() {
        if (isAdding && !isSaved) {
            $.delete_('SiteVisit');
        }
        dom.unbind('dialogclose');
        dom.find('.accordion').unbind('accordionchange');
        closeCallback(isSaved);
    }

    var serializedDom;
    function render(data, ignoreSubsiteVisits) {
        var newDom = $(data);
        dom.find('h3.sitevisit-placeholder').html(newDom.find('h3.sitevisit-placeholder').html())
        dom.find('div.sitevisit-placeholder').html(newDom.find('div.sitevisit-placeholder').html());
        if (!ignoreSubsiteVisits) {
            dom.find('h3.subsitevisits-placeholder').html(newDom.find('h3.subsitevisits-placeholder').html());
            dom.find('div.subsitevisits-placeholder').html(newDom.find('div.subsitevisits-placeholder').html());
        }
        dom.find('.coordinates-entered-selector input').bind('change', (function () {
            dom.find('.coordinates-entered-selector input').attr('checked') ?
                    dom.find('.coordinates-entered-visible').show() :
                    dom.find('.coordinates-entered-visible').hide();
        }));
        dom.find('.coordinates-entered-selector input').trigger('change');
        dom.find('.accordion').accordion('resize');
        if (isSubsiteAddingDisabled) {
            dom.find('.subsitevisits-placeholder').css('display', 'none');
        }
        serializedDom = dom.find('form').serialize();
    }

    function validate() {
        isValidating = true;
        if (dom.find('.sitevisit-placeholder .field-validation-error').length > 0) {
            dom.find('.accordion').accordion('activate', 0);
            dom.find('.sitevisit-placeholder .input-validation-error').first().focus();
            isValidating = false;
            return false;
        } else if (dom.find('.subsitevisits-placeholder .field-validation-error').length > 0) {
            dom.find('.accordion').accordion('activate', 1);
            isValidating = false;
            return false;
        }
        isValidating = false;
        return true;
    }

    function save() {
        serializedDom = dom.find('form').serialize();
        $.put('SiteVisit', serializedDom, function (data) {
            render(data);
            if (validate()) {
                isSaved = true;
                dom.dialog('close');
            }
        });
    }

    public.GetCoordinates = function () {
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('input.sitevisit-latitude').val(),
            dom.find('input.sitevisit-longitude').val());
        return coordinates;
    };

    public.Refresh = function (refresh) {
        if (refresh) {
            $.put('SiteVisit', dom.find('form').serialize(), function (data) {
                render(data);
                validate();
            });
        }
    };

    public.Add = function (callback) {
        isAdding = true;
        isSaved = false;
        closeCallback = callback;
        isSubsiteAddingDisabled = false;
        initialize();
        $.post('CreateSiteVisit', {}, function (data) {
            dom.dialog('open');
            render(data);
            setTimeout(function () { dom.find('div.sitevisit-placeholder input').first().focus(); }, 1);
        });
    };

    public.Edit = function (index, options) {
        isAdding = false;
        isSaved = false;
        closeCallback = options.onClose;
        isSubsiteAddingDisabled = options.disableSubsiteVisitAdding;
        initialize();
        $.get('SiteVisit', { siteVisitIndex: index }, function (data) {
            dom.dialog('open');
            render(data);
            setTimeout(function () { dom.find('div.sitevisit-placeholder input').first().focus(); }, 1);
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
                    dom.find('input.sitevisit-latitude').val(newCoordinates.Latitude);
                    dom.find('input.sitevisit-longitude').val(newCoordinates.Longitude);
                } else {
                    dom.find('input.sitevisit-latitude').val(result.latitude);
                    dom.find('input.sitevisit-longitude').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedSiteVisit', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('input.sitevisit-latitude').val(),
            dom.find('input.sitevisit-longitude').val());
        var options = { markerLoader: loadMapMarkers };
        if (coordinates.IsSpecified) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        }
        CoordinatePicker.Open(options, coordinatePickerClosed);
    };
};


var SiteVisitRemover = new function () {
    var dom = $(
        "<div title='Removing site visit'>\
            <div class='ui-placeholder-import-sitevisit'>\
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
        dom.find('.ui-placeholder-import-sitevisit').replaceWith($(data));
    }

    function remove() {
        $.delete_('SiteVisit', {}, function (data) {
            isSaved = true;
            dom.dialog('close');
        });
    }

    this.Open = function (index, callback) {
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.get('RemoveSiteVisit', { siteVisitIndex: index }, function (data) {
            dom.dialog('open');
            render(data);
        });
    };
};
