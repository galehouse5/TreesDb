function InitializeMeasurementFormValidation() {
    $('#measurementForm').validate({
        rules: {
            ScientificName: { TMDAlways: true, required: true, maxlength: 100 },
            CommonName: { TMDAlways: true, required: true, maxlength: 100 }
        }
    });
}

function AddSiteListSiteMeasurement(siteId, measurementId, scientificName, commonName) {
    var measurementDom = $('\
        <li id="' + measurementId + '" class="Measurement">\
            <span class="Icon"></span>\
            <div class="Column">\
                <span class="ScientificName">' + scientificName + '</span>\
                <br />\
                <span class="CommonName">' + commonName + '</span>\
            </div>\
            <div class="Column">\
                <a href="javascript:EditSiteMeasurement(\'' + siteId + '\', \'' + measurementId + '\')">Edit</a>\
                <br />\
                <a href="javascript:DeleteSiteMeasurement(\'' + siteId + '\', \'' + measurementId + '\')">Delete</a>\
            </div>\
            <div class="ui-helper-clearfix"></div>\
        </li>');
    $('#SiteList #' + siteId + ' > ul.MeasurementList').prepend(measurementDom);
}

function AddSiteMeasurement(siteId) {
    $.get('/Import/AddSiteMeasurementDialog',
        { siteId: siteId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 500,
                buttons: {
                    'Save': function () {
                        if ($('#measurementForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveAddSiteMeasurementDialog',
                                $('#measurementForm').serialize(),
                                function (data) {                                    
                                    AddSiteListSiteMeasurement(data.siteId, data.measurementId, data.scientificName, data.commonName);
                                    $('#' + siteId + ' > div > .NumberOfMeasurements').val(parseInt($('#' + siteId + ' > div > .NumberOfMeasurements').val()) + 1);
                                    $('#measurementsForm').validate().resetForm();
                                    dialog.dialog('destroy').remove();
                                }
                            );
                        }
                    },
                    'Cancel': function () {
                        $(this).dialog('destroy').remove();
                    }
                },
                close: function () {
                    $(this).dialog('destroy').remove();
                }
            });
            InitializeMeasurementFormValidation();
            $('#Genus').focus();
        });
}

function UpdateSiteListSiteMeasurement(siteId, measurementId, scientificName, commonName) {
    $('#SiteList #' + siteId + ' #' + measurementId + ' span.ScientificName').html(scientificName);
    $('#SiteList #' + siteId + ' #' + measurementId + ' span.CommonName').html(commonName);
}

function EditSiteMeasurement(siteId, measurementId) {
    $.get('/Import/EditSiteMeasurementDialog',
        { siteId: siteId, measurementId: measurementId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 500,
                buttons: {
                    'Save': function () {
                        if ($('#measurementForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveEditSiteMeasurementDialog',
                                $('#measurementForm').serialize(),
                                function (data) {
                                    UpdateSiteListSiteMeasurement(data.siteId, data.measurementId, data.scientificName, data.commonName);
                                    dialog.dialog('destroy').remove();
                                }
                            );
                        }
                    },
                    'Cancel': function () {
                        $(this).dialog('destroy').remove();
                    }
                },
                close: function () {
                    $(this).dialog('destroy').remove();
                }
            });
            InitializeMeasurementFormValidation();
            $('#Genus').focus();
        });
}

function RemoveSiteListSiteMeasurement(siteId, measurementId) {
    $('#SiteList #' + siteId + ' #' + measurementId).remove();
}

function DeleteSiteMeasurement(siteId, measurementId) {
    $.get("/Import/DeleteSiteMeasurementDialog",
        { siteId: siteId, measurementId: measurementId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true,
                buttons: {
                    'Delete': function () {
                        var dialog = this;
                        $.post("/Import/ConfirmDeleteSiteMeasurement",
                            { siteId: siteId, measurementId: measurementId },
                            function (data) {
                                RemoveSiteListSiteMeasurement(siteId, measurementId);
                                $('#' + siteId + ' > div > .NumberOfMeasurements').val(parseInt($('#' + siteId + ' > div > .NumberOfMeasurements').val()) - 1);
                                $(dialog).dialog('destroy').remove();
                            });
                    },
                    'Cancel': function () {
                        $(this).dialog('destroy').remove();
                    }
                },
                close: function () {
                    $(this).dialog('destroy').remove();
                }
            });
        });
}

function AddSiteListSubsiteMeasurement(siteId, subsiteId, measurementId, scientificName, commonName) {
    var measurementDom = $('\
        <li id="' + measurementId + '" class="Measurement">\
            <span class="Icon"></span>\
            <div class="Column">\
                <span class="ScientificName">' + scientificName + '</span>\
                <br />\
                <span class="CommonName">' + commonName + '</span>\
            </div>\
            <div class="Column">\
                <a href="javascript:EditSubsiteMeasurement(\'' + siteId + '\', \'' + subsiteId + '\', \'' + measurementId + '\')">Edit</a>\
                <br />\
                <a href="javascript:DeleteSubsiteMeasurement(\'' + siteId + '\', \'' + subsiteId + '\', \'' + measurementId + '\')">Delete</a>\
            </div>\
            <div class="ui-helper-clearfix"></div>\
        </li>');
    $('#SiteList #' + siteId + ' #' + subsiteId + ' ul.MeasurementList').prepend(measurementDom);
}

function AddSubsiteMeasurement(siteId, subsiteId) {
    $.get('/Import/AddSubsiteMeasurementDialog',
        { siteId: siteId, subsiteId: subsiteId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 500,
                buttons: {
                    'Save': function () {
                        if ($('#measurementForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveAddSubsiteMeasurementDialog',
                                $('#measurementForm').serialize(),
                                function (data) {
                                    AddSiteListSubsiteMeasurement(data.siteId, data.subsiteId, data.measurementId, data.scientificName, data.commonName);
                                    $('#' + subsiteId + ' > div > .NumberOfMeasurements').val(parseInt($('#' + subsiteId + ' > div > .NumberOfMeasurements').val()) + 1);
                                    $('#' + siteId + ' > div > .NumberOfMeasurements').val(parseInt($('#' + siteId + ' > div > .NumberOfMeasurements').val()) + 1);
                                    $('#measurementsForm').validate().resetForm();
                                    dialog.dialog('destroy').remove();
                                }
                            );
                        }
                    },
                    'Cancel': function () {
                        $(this).dialog('destroy').remove();
                    }
                },
                close: function () {
                    $(this).dialog('destroy').remove();
                }
            });
            InitializeMeasurementFormValidation();
            $('#Genus').focus();
        });
}


function UpdateSiteListSubsiteMeasurement(siteId, subsiteId, measurementId, scientificName, commonName) {
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId + ' span.ScientificName').html(scientificName);
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId + ' span.CommonName').html(commonName);
}

function EditSubsiteMeasurement(siteId, subsiteId, measurementId) {
    $.get('/Import/EditSubsiteMeasurementDialog',
        { siteId: siteId, subsiteId: subsiteId, measurementId: measurementId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 500,
                buttons: {
                    'Save': function () {
                        if ($('#measurementForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveEditSubsiteMeasurementDialog',
                                $('#measurementForm').serialize(),
                                function (data) {
                                    UpdateSiteListSubsiteMeasurement(data.siteId, data.subsiteId, data.measurementId, data.scientificName, data.commonName);
                                    dialog.dialog('destroy').remove();
                                }
                            );
                        }
                    },
                    'Cancel': function () {
                        $(this).dialog('destroy').remove();
                    }
                },
                close: function () {
                    $(this).dialog('destroy').remove();
                }
            });
            InitializeMeasurementFormValidation();
            $('#Genus').focus();
        });
}

function RemoveSiteListSubsiteMeasurement(siteId, subsiteId, measurementId) {
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId).remove();
}

function DeleteSubsiteMeasurement(siteId, subsiteId, measurementId) {
    $.get("/Import/DeleteSubsiteMeasurementDialog",
        { siteId: siteId, subsiteId: subsiteId, measurementId: measurementId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true,
                buttons: {
                    'Delete': function () {
                        var dialog = this;
                        $.post("/Import/ConfirmDeleteSubsiteMeasurement",
                            { siteId: siteId, subsiteId: subsiteId, measurementId: measurementId },
                            function (data) {
                                RemoveSiteListSubsiteMeasurement(siteId, subsiteId, measurementId);
                                $('#' + subsiteId + ' > div > .NumberOfMeasurements').val(parseInt($('#' + subsiteId + ' > div > .NumberOfMeasurements').val()) - 1);
                                $('#' + siteId + ' > div > .NumberOfMeasurements').val(parseInt($('#' + siteId + ' > div > .NumberOfMeasurements').val()) - 1);
                                $(dialog).dialog('destroy').remove();
                            });
                    },
                    'Cancel': function () {
                        $(this).dialog('destroy').remove();
                    }
                },
                close: function () {
                    $(this).dialog('destroy').remove();
                }
            });
        });
}

$(document).ready(function () {
    $('#measurementsForm').validate();
    $('#SiteList .Site').each(function (index, value) {
        var siteId = value.id;
        $(value).find('div > .NumberOfMeasurements')
                .rules("add", {
                    min: 1,
                    messages: {
                        min: "You must <a href='javascript:AddSiteMeasurement(\"" + siteId + "\")'>add a measurement</a> before moving on."
                    }
                });
        $(value).find('.Subsite').each(function (index, value) {
            var subsiteId = value.id;
            $(value).find('div > .NumberOfMeasurements')
                    .rules("add", {
                        min: 1,
                        messages: {
                            min: "You must <a href='javascript:AddSubsiteMeasurement(\"" + siteId + "\", \"" + subsiteId + "\")'>add a measurement</a> before moving on."
                        }
                    });
        });
    });
    $('.wizard a').click(function () {
        if (!$(this).hasClass('advance') || $('#measurementsForm').valid()) {
            return true;
        } else {
            return false;
        }
    });
});