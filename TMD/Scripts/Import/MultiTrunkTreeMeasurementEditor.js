var MultiTrunkTreeMeasurementEditor = new function () {
    var public = this;
    var isSaved, isAdding, areTrunkMeasurementsValidated;
    var closeCallback;
    var step;

    var Sections = { General: 0, Height: 1, Girth: 2, Crown: 3, Trunk: 4, Status: 5, Misc: 6 };
    var editor, sections;
    $(document).ready(function () {
        editor = $("<div id='MultiTrunkTreeMeasurementEditor'>\
            <form>\
                <div id='MultiTrunkTreeMeasurementSections' class='Step1'>\
                    <ul>\
                        <li><a href='#MultiTrunkTreeMeasurementGeneralSection'>General</a></li>\
                        <li><a href='#MultiTrunkTreeMeasurementHeightSection'>Height</a></li>\
                        <li><a href='#MultiTrunkTreeMeasurementGirthSection'>Girth</a></li>\
                        <li><a href='#MultiTrunkTreeMeasurementCrownSection'>Crown</a></li>\
                        <li><a href='#MultiTrunkTreeMeasurementTrunkSection'>Trunk</a></li>\
                        <li><a href='#MultiTrunkTreeMeasurementStatusSection'>Status</a></li>\
                        <li><a href='#MultiTrunkTreeMeasurementMiscSection'>Misc</a></li>\
                    </ul>\
                    <div id='MultiTrunkTreeMeasurementGeneralSection'>\
                        <div class='GeneralSection'></div>\
                    </div>\
                    <div id='MultiTrunkTreeMeasurementHeightSection'>\
                        <div class='HeightSection'></div>\
                    </div>\
                    <div id='MultiTrunkTreeMeasurementGirthSection'>\
                        <div  class='GirthSection'></div>\
                    </div>\
                    <div id='MultiTrunkTreeMeasurementCrownSection'>\
                        <div class='CrownSection'></div>\
                    </div>\
                    <div id='MultiTrunkTreeMeasurementTrunkSection'>\
                        <div class='TrunkSection'></div>\
                    </div>\
                    <div id='MultiTrunkTreeMeasurementStatusSection'>\
                        <div class='StatusSection'></div>\
                    </div>\
                    <div id='MultiTrunkTreeMeasurementMiscSection'>\
                        <div class='MiscSection'></div>\
                    </div>\
                </div>\
            </form>\
            <div class='Step2'>\
            </div>\
        </div>")
            .dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
                width: 440, position: 'center'
            })
            .bind('dialogclose', dispose);
        sections = $('#MultiTrunkTreeMeasurementSections')
            .tabs({ selected: 0 })
            .bind('tabsselect', function () {
                setTimeout(function () {
                    focusFirstVisibleErrorOrInput($('#MultiTrunkTreeMeasurementSections').tabs('option', 'selected'));
                }, 1);
            })
            .bind('tabsselect', function (event, ui) {
                repositionHeightGirthAndCrownFields(ui.index);
            });
    });

    function initialize() {
        step = 1;
        areTrunkMeasurementsValidated = false;
        editor.dialog('option', 'title', isAdding ? 'Adding multi trunk tree measurement' : 'Editing multi trunk tree measurement')
            .dialog('option', 'buttons', { 'Next >': advanceToStep2, 'Cancel': function () { editor.dialog('close'); } });
        sections.tabs('select', 0);
    }

    function advanceToStep2() {
        $.put('TreeMeasurement', editor.find('form').serialize(), function (data) {
            render(data);
            if (validate()) {
                step = 2;
                editor.dialog('option', 'buttons', { 'Save': save, 'Cancel': function () { editor.dialog('close'); }, '< Back': retreatToStep1 });
                render(data);
            }
        });
    }

    function retreatToStep1() {
        $.put('TreeMeasurement', editor.find('form').serialize(), function (data) {
            step = 1;
            editor.dialog('option', 'buttons', { 'Next >': advanceToStep2, 'Cancel': function () { editor.dialog('close'); } });
            render(data);
        });
    }

    function repositionHeightGirthAndCrownFields(currentSection) {
        switch (currentSection) {
            case Sections.General:
                if (sections.find('.GeneralSection .Height').children().length == 0) {
                    sections.find('.GeneralSection .Height').swap('.HeightSection .Height');
                }
                if (sections.find('.GeneralSection .HeightMeasurementMethod').children().length == 0) {
                    sections.find('.GeneralSection .HeightMeasurementMethod').swap('.HeightSection .HeightMeasurementMethod');
                }
                if (sections.find('.GeneralSection .Girth').children().length == 0) {
                    sections.find('.GeneralSection .Girth').swap('.GirthSection .Girth');
                }
                if (sections.find('.GeneralSection .CrownSpread').children().length == 0) {
                    sections.find('.GeneralSection .CrownSpread').swap('.CrownSection .CrownSpread');
                }
                break;
            case Sections.Height:
                if (sections.find('.HeightSection .HeightMeasurementMethod').children().length == 0) {
                    sections.find('.HeightSection .HeightMeasurementMethod').swap('.GeneralSection .HeightMeasurementMethod');
                }
                if (sections.find('.HeightSection .Height').children().length == 0) {
                    sections.find('.HeightSection .Height').swap('.GeneralSection .Height');
                }
                break;
            case Sections.Girth:
                if (sections.find('.GirthSection .Girth').children().length == 0) {
                    sections.find('.GirthSection .Girth').swap('.GeneralSection .Girth');
                }
                break;
            case Sections.Crown:
                if (sections.find('.CrownSection .CrownSpread').children().length == 0) {
                    sections.find('.CrownSection .CrownSpread').swap('.GeneralSection .CrownSpread');
                }
                break;
        }
    }

    function focusFirstVisibleErrorOrInput(currentSection) {
        switch (currentSection) {
            case Sections.General:
                sections.find('.GeneralSection .input-validation-error').length > 0 ?
                    sections.find('.GeneralSection .input-validation-error').first().focus()
                    : sections.find('.GeneralSection input').first().focus();
                break;
            case Sections.Height:
                sections.find('.HeightSection .input-validation-error').length > 0 ?
                    sections.find('.HeightSection .input-validation-error').first().focus()
                    : sections.find('.HeightSection input').first().focus();
                break;
            case Sections.Girth:
                sections.find('.GirthSection .input-validation-error').length > 0 ?
                    sections.find('.GirthSection .input-validation-error').first().focus()
                    : sections.find('.GirthSection input').first().focus();
                break;
            case Sections.Crown:
                sections.find('.CrownSection .input-validation-error').length > 0 ?
                    sections.find('.CrownSection .input-validation-error').first().focus()
                    : sections.find('.CrownSection input').first().focus();
                break;
            case Sections.Trunk:
                sections.find('.TrunkSection .input-validation-error').length > 0 ?
                    sections.find('.TrunkSection .input-validation-error').first().focus()
                    : sections.find('.TrunkSection input').first().focus();
                break;
            case Sections.Status:
                sections.find('.StatusSection .input-validation-error').length > 0 ?
                    sections.find('.StatusSection .input-validation-error').first().focus()
                    : sections.find('.StatusSection input').first().focus();
                break;
            case Sections.Misc:
                sections.find('.MiscSection .input-validation-error').length > 0 ?
                    sections.find('.MiscSection .input-validation-error').first().focus()
                    : sections.find('.MiscSection input').first().focus();
                break;
        }
    }

    function dispose() {
        sections.tabs('select', 0);
        sections.find('.GeneralSection').empty();
        sections.find('.HeightSection').empty();
        sections.find('.GirthSection').empty();
        sections.find('.TrunkSection').empty();
        sections.find('.CrownSection').empty();
        sections.find('.StatusSection').empty();
        sections.find('.MiscSection').empty();
        editor.find('.Step2').empty();
        if (isAdding && !isSaved) {
            $.delete_('TreeMeasurement');
        }
        closeCallback(isSaved);
    }

    function render(data) {
        var newDom = $(data);
        if (step == 1) {
            sections.find('.GeneralSection').replaceWith(newDom.find('.GeneralSection'));
            sections.find('.HeightSection').replaceWith(newDom.find('.HeightSection'));
            sections.find('.GirthSection').replaceWith(newDom.find('.GirthSection'));
            sections.find('.TrunkSection').replaceWith(newDom.find('.TrunkSection'));
            sections.find('.CrownSection').replaceWith(newDom.find('.CrownSection'));
            sections.find('.StatusSection').replaceWith(newDom.find('.StatusSection'));
            sections.find('.MiscSection').replaceWith(newDom.find('.MiscSection'));
            repositionHeightGirthAndCrownFields(sections.tabs('option', 'selected'));
            sections.find('.CoordinatePicker').button({ icons: { primary: 'ui-icon-circle-zoomout'} });
            sections.find('.EnterPublicAccess').buttonset();
            sections.find('.EnterCoordinates input')
            .bind('change', (function () {
                if (sections.find('.EnterCoordinates input').attr('checked')) {
                    sections.find('.CoordinatesEntered').show();
                    sections.find('.CoordinatesEntered input').first().focus();
                } else {
                    sections.find('.CoordinatesEntered').hide();
                }
            })).trigger('change').button();
            sections.find('.CommonName input')
            .autocomplete({ source: "FindSimilarCommonNames", minLength: 2, select: function (event, ui) {
                sections.find('.ScientificName input').val(ui.item.scientificName);
            }
            });
            sections.find('.EnterDistanceAndAngleMeasurements input')
            .bind('change', (function () {
                if (sections.find('.EnterDistanceAndAngleMeasurements input').attr('checked')) {
                    sections.find('.DistanceAndAngleMeasurementsEntered').show();
                    sections.find('.DistanceAndAngleMeasurementsEntered input').first().focus();
                } else {
                    sections.find('.DistanceAndAngleMeasurementsEntered').hide();
                }
            })).trigger('change').button();
            sections.find('.CalculateHeightAndOffset').button({ icons: { primary: 'ui-icon-calculator'} });
            editor.find('.Step1').show();
            editor.find('.Step2').hide();
        } else {
            editor.find('.Step2').replaceWith(newDom.find('.Step2'))
            editor.find('.Step2 .ImportAddTrunkMeasurementButton').button();
            editor.find('.ImportEditButton').button({ icons: { primary: 'ui-icon-pencil'} });
            editor.find('.ImportRemoveButton').button({ icons: { primary: 'ui-icon-trash'} });
            editor.find('.Step1').hide();
            editor.find('.Step2').show();
            if (!areTrunkMeasurementsValidated) {
                editor.find('.Step2 .field-validation-error').remove();
            }
        }
    }

    function validate() {
        if (step == 1) {
            var tabsWithErrors = new Array();
            if (sections.find('.GeneralSection .input-validation-error').length > 0) {
                tabsWithErrors.push(Sections.General);
            }
            if (sections.find('.HeightSection .input-validation-error').length > 0) {
                tabsWithErrors.push(Sections.Height);
            }
            if (sections.find('.GirthSection .input-validation-error').length > 0) {
                tabsWithErrors.push(Sections.Girth);
            }
            if (sections.find('.CrownSection .input-validation-error').length > 0) {
                tabsWithErrors.push(Sections.Crown);
            }
            if (sections.find('.TrunkSection .input-validation-error').length > 0) {
                tabsWithErrors.push(Sections.Trunk);
            }
            if (sections.find('.StatusSection .input-validation-error').length > 0) {
                tabsWithErrors.push(Sections.Status);
            }
            if (sections.find('.MiscSection .input-validation-error').length > 0) {
                tabsWithErrors.push(Sections.Misc);
            }
            if (tabsWithErrors.length > 0) {
                var currentlySelectedTab = sections.tabs('option', 'selected');
                var tabWithError;
                while (tabsWithErrors.length > 0) {
                    tabWithError = tabsWithErrors.pop();
                    if (tabWithError == currentlySelectedTab) {
                        focusFirstVisibleErrorOrInput(sections.tabs('option', 'selected'));
                        return false;
                    }
                }
                sections.tabs('select', tabWithError);
                return false;
            }
        } else {
            if (editor.find('.Step2 .field-validation-error').length > 0) {
                return false;
            }
        }
        return true;
    }

    function save() {
        $.put('TreeMeasurement', editor.find('form').serialize(), function (data) {
            areTrunkMeasurementsValidated = true;
            render(data);
            if (validate()) {
                isSaved = true;
                editor.dialog('close');
            }
        });
    }

    public.CalculateDetailedHeightMeasurements = function () {
        $.put('TreeMeasurement', editor.find('form').serialize(), function (data) {
            render(data);
        });
    }

    public.Add = function (siteVisitIndex, subsiteVisitIndex, callback) {
        isAdding = true;
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.post('CreateMultiTrunkTreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex }, function (data) {
            render(data);
            editor.dialog('open');
            setTimeout(function () { sections.find('input').first().focus(); }, 1);
        });
    };

    public.Edit = function (siteVisitIndex, subsiteVisitIndex, TreeMeasurementIndex, callback) {
        isAdding = false;
        isSaved = false;
        closeCallback = callback;
        initialize();
        $.get('TreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex, TreeMeasurementIndex: TreeMeasurementIndex }, function (data) {
            render(data);
            editor.dialog('open');
            setTimeout(function () { sections.find('input').first().focus(); }, 1);
        });
    };

    public.Show = function () {
        editor.bind('dialogclose', dispose).dialog('open');
    };

    public.Hide = function () {
        editor.unbind('dialogclose').dialog('close');
    };

    public.OpenCoordinatePicker = function (tripHasEnteredCoordinates) {
        function CoordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    sections.find('.latitude input').val(newCoordinates.Latitude);
                    sections.find('.longitude input').val(newCoordinates.Longitude);
                } else {
                    sections.find('.latitude input').val(result.latitude);
                    sections.find('.longitude input').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedTreeMeasurement', {}, callback);
        };
        var coordinates = ValueObjectService.CreateCoordinates(
            sections.find('.latitude input').val(),
            sections.find('.longitude input').val());
        var options = { markerLoader: loadMapMarkers, hasMarkersToLoad: tripHasEnteredCoordinates };
        if (coordinates.IsSpecified) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        }
        CoordinatePicker.Open(options, CoordinatePickerClosed);
        public.Hide();
    };

    public.Refresh = function (refresh) {
        $.put('TreeMeasurement', editor.find('form').serialize(), function (data) {
            render(data);
            validate();
        });
    };
};

var MultiTrunkTreeMeasurementRemover = new function () {
    var isSaved;
    var closeCallback;

    var dialog;
    $(document).ready(function () {
        dialog = $("<div id='MultiTrunkTreeMeasurementRemover' title='Removing multi trunk tree measurement'>\
            <div class='Placeholder'></div>\
        </div>")
        .dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { $('#MultiTrunkTreeMeasurementRemover').dialog('close'); } },
            close: dispose
        });
    });

    function dispose() {
        closeCallback(isSaved);
    }

    function render(data) {
        dialog.find('.Placeholder').replaceWith($(data));
    }

    function remove() {
        $.delete_('TreeMeasurement', {}, function (data) {
            isSaved = true;
            dialog.dialog('close');
        });
    }

    this.Open = function (siteVisitIndex, subsiteVisitIndex, TreeMeasurementIndex, callback) {
        isSaved = false;
        closeCallback = callback;
        $.get('RemoveTreeMeasurement', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex, TreeMeasurementIndex: TreeMeasurementIndex }, function (data) {
            render(data);
            dialog.dialog('open');
        });
    };
};
