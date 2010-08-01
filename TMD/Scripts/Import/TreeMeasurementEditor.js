var TreeMeasurementEditor = new function () {
    var public = this;
    var isSaved, isAdding;
    var closeCallback;

    var Sections = { General: 0, Height: 1, Girth: 2, Crown: 3, Trunk: 4, Status: 5, Misc: 6 };
    $(document).ready(function () {
        $(
"<div id='TreeMeasurementEditor'>\
    <form>\
        <div id='TreeMeasurementSections'>\
            <ul>\
                <li><a href='#TreeMeasurementGeneralSection'>General</a></li>\
                <li><a href='#TreeMeasurementHeightSection'>Height</a></li>\
                <li><a href='#TreeMeasurementGirthSection'>Girth</a></li>\
                <li><a href='#TreeMeasurementCrownSection'>Crown</a></li>\
                <li><a href='#TreeMeasurementTrunkSection'>Trunk</a></li>\
                <li><a href='#TreeMeasurementStatusSection'>Status</a></li>\
                <li><a href='#TreeMeasurementMiscSection'>Misc</a></li>\
            </ul>\
            <div id='TreeMeasurementGeneralSection'></div>\
            <div id='TreeMeasurementHeightSection'></div>\
            <div id='TreeMeasurementGirthSection'></div>\
            <div id='TreeMeasurementCrownSection'></div>\
            <div id='TreeMeasurementTrunkSection'></div>\
            <div id='TreeMeasurementStatusSection'></div>\
            <div id='TreeMeasurementMiscSection'></div>\
        </div>\
    </form>\
</div>").dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
    width: 440, position: 'center',
    buttons: { 'Save': save, 'Cancel': function () { $('#TreeMeasurementEditor').dialog('close'); } }
});
        $('#TreeMeasurementSections')
            .tabs()
            .bind('tabsselect', function () {
                setTimeout(function () {
                    focusFirstVisibleErrorOrInput($('#TreeMeasurementSections').tabs('option', 'selected'));
                }, 1);
            })
            .bind('tabsselect', function (event, ui) {
                repositionHeightGirthAndCrownFields(ui.index);
                return false;
            });
        $('#TreeMeasurementEditor')
            .bind('dialogclose', dispose);
    });


    function initialize() {
        $('#TreeMeasurementEditor').dialog('option', 'title', isAdding ? 'Adding tree measurement' : 'Editing tree measurement');
        $('#TreeMeasurementSections').tabs('select', 0);
    }

    function repositionHeightGirthAndCrownFields(currentSection) {
        switch (currentSection) {
            case Sections.General:
                if ($('#TreeMeasurementGeneralSection .Height').children().length == 0) {
                    $('#TreeMeasurementGeneralSection .Height')
                        .swap('#TreeMeasurementHeightSection .Height');
                }
                if ($('#TreeMeasurementGeneralSection .Girth').children().length == 0) {
                    $('#TreeMeasurementGeneralSection .Girth')
                        .swap('#TreeMeasurementGirthSection .Girth');
                }
                if ($('#TreeMeasurementGeneralSection .CrownSpread').children().length == 0) {
                    $('#TreeMeasurementGeneralSection .CrownSpread')
                        .swap('#TreeMeasurementCrownSection .CrownSpread');
                }
                break;
            case Sections.Height:
                if ($('#TreeMeasurementHeightSection .Height').children().length == 0) {
                    $('#TreeMeasurementHeightSection .Height')
                        .swap('#TreeMeasurementGeneralSection .Height');
                }
                break;
            case Sections.Girth:
                if ($('#TreeMeasurementGirthSection .Girth').children().length == 0) {
                    $('#TreeMeasurementGirthSection .Girth')
                        .swap('#TreeMeasurementGeneralSection .Girth');
                }
                break;
            case Sections.Crown:
                if ($('#TreeMeasurementCrownSection .CrownSpread').children().length == 0) {
                    $('#TreeMeasurementCrownSection .CrownSpread')
                        .swap('#TreeMeasurementGeneralSection .CrownSpread');
                }
                break;
        }
    }

    function focusFirstVisibleErrorOrInput(currentSection) {
        switch (currentSection) {
            case Sections.General:
                if ($('#TreeMeasurementGeneralSection .input-validation-error').length > 0) {
                    $('#TreeMeasurementGeneralSection .input-validation-error').first().focus();
                } else {
                    $('#TreeMeasurementGeneralSection input').first().focus();
                }
                break;
            case Sections.Height:
                if ($('#TreeMeasurementHeightSection .input-validation-error').length > 0) {
                    $('#TreeMeasurementHeightSection .input-validation-error').first().focus();
                } else {
                    $('#TreeMeasurementHeightSection input').first().focus();
                }
                break;
            case Sections.Girth:
                if ($('#TreeMeasurementGirthSection .input-validation-error').length > 0) {
                    $('#TreeMeasurementGirthSection .input-validation-error').first().focus();
                } else {
                    $('#TreeMeasurementGirthSection input').first().focus();
                }
                break;
            case Sections.Crown:
                if ($('#TreeMeasurementCrownSection .input-validation-error').length > 0) {
                    $('#TreeMeasurementCrownSection .input-validation-error').first().focus();
                } else {
                    $('#TreeMeasurementCrownSection input').first().focus();
                }
                break;
            case Sections.Trunk:
                if ($('#TreeMeasurementTrunkSection .input-validation-error').length > 0) {
                    $('#TreeMeasurementTrunkSection .input-validation-error').first().focus();
                } else {
                    $('#TreeMeasurementTrunkSection input').first().focus();
                }
                break;
            case Sections.Status:
                if ($('#TreeMeasurementStatusSection .input-validation-error').length > 0) {
                    $('#TreeMeasurementStatusSection .input-validation-error').first().focus();
                } else {
                    $('#TreeMeasurementStatusSection input').first().focus();
                }
                break;
            case Sections.Misc:
                if ($('#TreeMeasurementMiscSection .input-validation-error').length > 0) {
                    $('#TreeMeasurementMiscSection .input-validation-error').first().focus();
                } else {
                    $('#TreeMeasurementMiscSection input').first().focus();
                }
                break;
        }
    }

    function dispose() {
        if (isAdding && !isSaved) {
            $.delete_('TreeMeasurement');
        }
        closeCallback(isSaved);
    }

    function render(data) {
        var newEditor = $(data);
        $('#TreeMeasurementGeneralSection')
            .html(newEditor.find('#TreeMeasurementGeneralSection').html());
        $('#TreeMeasurementHeightSection')
            .html(newEditor.find('#TreeMeasurementHeightSection').html());
        $('#TreeMeasurementGirthSection')
            .html(newEditor.find('#TreeMeasurementGirthSection').html());
        $('#TreeMeasurementTrunkSection')
            .html(newEditor.find('#TreeMeasurementTrunkSection').html());
        $('#TreeMeasurementCrownSection')
            .html(newEditor.find('#TreeMeasurementCrownSection').html());
        $('#TreeMeasurementStatusSection')
            .html(newEditor.find('#TreeMeasurementStatusSection').html());
        $('#TreeMeasurementMiscSection')
            .html(newEditor.find('#TreeMeasurementMiscSection').html());
        repositionHeightGirthAndCrownFields($('#TreeMeasurementSections').tabs('option', 'selected'));
        $('#TreeMeasurementEditor').find('.CoordinatePicker')
            .button({ icons: { primary: 'ui-icon-circle-zoomout'} });
        $('#TreeMeasurementEditor').find('.EnterPublicAccess')
            .buttonset();
        $('#TreeMeasurementEditor').find('.EnterCoordinates input')
            .bind('change', (function () {
                if ($('#TreeMeasurementEditor .EnterCoordinates input').attr('checked')) {
                    $('#TreeMeasurementEditor .CoordinatesEntered')
                        .show();
                    $('#TreeMeasurementEditor .CoordinatesEntered input').first()
                        .focus();
                } else {
                    $('#TreeMeasurementEditor .CoordinatesEntered')
                        .hide();
                }
            }))
            .trigger('change')
            .button();
        $('#TreeMeasurementEditor .CommonName input')
            .autocomplete({ source: "FindSimilarCommonNames", minLength: 2, select: function (event, ui) {
                $('#TreeMeasurementEditor .ScientificName input')
                    .val(ui.item.scientificName);
            }
            });
        $('#TreeMeasurementEditor').find('.EnterDistanceAndAngleMeasurements input')
            .bind('change', (function () {
                if ($('#TreeMeasurementEditor .EnterDistanceAndAngleMeasurements input').attr('checked')) {
                    $('#TreeMeasurementEditor .DistanceAndAngleMeasurementsEntered')
                        .show();
                    $('#TreeMeasurementEditor .DistanceAndAngleMeasurementsEntered input').first()
                        .focus();
                } else {
                    $('#TreeMeasurementEditor .DistanceAndAngleMeasurementsEntered')
                        .hide();
                }
            }))
            .trigger('change')
            .button();
        $('#TreeMeasurementEditor .CalculateHeightAndOffset')
            .button({ icons: { primary: 'ui-icon-calculator'} });
    }

    function validate() {
        var tabsWithErrors = new Array();
        if ($('#TreeMeasurementGeneralSection .input-validation-error').length > 0) {
            tabsWithErrors.push(Sections.General);
        }
        if ($('#TreeMeasurementHeightSection .input-validation-error').length > 0) {
            tabsWithErrors.push(Sections.Height);
        }
        if ($('#TreeMeasurementGirthSection .input-validation-error').length > 0) {
            tabsWithErrors.push(Sections.Girth);
        }
        if ($('#TreeMeasurementCrownSection .input-validation-error').length > 0) {
            tabsWithErrors.push(Sections.Crown);
        }
        if ($('#TreeMeasurementTrunkSection .input-validation-error').length > 0) {
            tabsWithErrors.push(Sections.Trunk);
        }
        if ($('#TreeMeasurementStatusSection .input-validation-error').length > 0) {
            tabsWithErrors.push(Sections.Status);
        }
        if ($('#TreeMeasurementMiscSection .input-validation-error').length > 0) {
            tabsWithErrors.push(Sections.Misc);
        }
        if (tabsWithErrors.length > 0) {
            var currentlySelectedTab = $('#TreeMeasurementSections')
                .tabs('option', 'selected');
            var tabWithError;
            while (tabsWithErrors.length > 0) {
                tabWithError = tabsWithErrors.pop();
                if (tabWithError == currentlySelectedTab) {
                    focusFirstVisibleErrorOrInput();
                    return false;
                }
            }
            $('#TreeMeasurementSections')
                .tabs('select', tabWithError);
            return false;
        } else {
            return true;
        }
    }

    function save() {
        $.put('TreeMeasurement', $('#TreeMeasurementEditor form').serialize(), function (data) {
            render(data);
            if (validate()) {
                isSaved = true;
                $('#TreeMeasurementEditor').dialog('close');
            }
        });
    }

    public.CalculateDetailedHeightMeasurements = function () {
        $.put('TreeMeasurement', $('#TreeMeasurementEditor form').serialize(), function (data) {
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
            $('#TreeMeasurementEditor').dialog('open');
            setTimeout(function () { $('#TreeMeasurementEditor input').first().focus(); }, 1);
        });
    };

    public.Edit = function (siteVisitIndex, subsiteVisitIndex, treeMeasurementIndex, callback) {
        isAdding = false;
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.get('TreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex, treeMeasurementIndex: treeMeasurementIndex }, function (data) {
            render(data);
            $('#TreeMeasurementEditor').dialog('open');
            setTimeout(function () { $('#TreeMeasurementEditor input').first().focus(); }, 1);
        });
    };

    public.Show = function () {
        $('#TreeMeasurementEditor').bind('dialogclose', dispose);
        $('#TreeMeasurementEditor').dialog('open');
    };

    public.Hide = function () {
        $('#TreeMeasurementEditor').unbind('dialogclose');
        $('#TreeMeasurementEditor').dialog('close');
    };

    public.OpenCoordinatePicker = function (tripHasEnteredCoordinates) {
        function CoordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    $('#TreeMeasurementEditor .latitude input').val(newCoordinates.Latitude);
                    $('#TreeMeasurementEditor .longitude input').val(newCoordinates.Longitude);
                } else {
                    $('#TreeMeasurementEditor .latitude input').val(result.latitude);
                    $('#TreeMeasurementEditor .longitude input').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedTreeMeasurement', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            $('#TreeMeasurementEditor .latitude input').val(),
            $('#TreeMeasurementEditor .longitude input').val());
        var options = { markerLoader: loadMapMarkers, hasMarkersToLoad: tripHasEnteredCoordinates };
        if (coordinates.IsSpecified) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        }
        CoordinatePicker.Open(options, CoordinatePickerClosed);
    };
};

var TreeMeasurementRemover = new function () {
    var isSaved;
    var closeCallback;

    $(document).ready(function () {
        $(
"<div id='TreeMeasurementRemover' title='Removing tree measurement'>\
    <div id='TreeMeasurementRemoverPlaceholder'>\
    </div>\
</div>").dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { $('#TreeMeasurementRemover').dialog('close'); } },
            close: dispose
        });
    });

    function dispose() {
        closeCallback(isSaved);
    }

    function render(data) {
        $('#TreeMeasurementRemoverPlaceholder').replaceWith($(data));
    }

    function remove() {
        $.delete_('TreeMeasurement', {}, function (data) {
            isSaved = true;
            $('#TreeMeasurementRemover').dialog('close');
        });
    }

    this.Open = function (siteVisitIndex, subsiteVisitIndex, treeMeasurementIndex, callback) {
        isSaved = false;
        closeCallback = callback;
        $.get('RemoveTreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex, treeMeasurementIndex: treeMeasurementIndex }, function (data) {
            render(data);
            $('#TreeMeasurementRemover').dialog('open');
        });
    };
};
