function InitializeMeasurementFormValidation() {
    $('#measurementForm').validate({
        rules: {
            Genus: { TMDAlways: true, required: true, maxlength: 100 },
            Species: { TMDAlways: true, required: true, maxlength: 100 },
            CommonName: { TMDAlways: true, required: true, maxlength: 100 }
        }
    });
}

function InitializeSiteNumberOfMeasurementsFormValidation(form, siteId) {
    $(form).validate({
        rules: {
            NumberOfMeasurements: { min: 1 }
        },
        messages: {
            NumberOfMeasurements: { min: "You must <a href='javascript:AddSiteMeasurement('" + siteId + "')'>add a measurement</a> before moving to the next step." }
        }
    });
}

function InitializeSubsiteNumberOfMeasurementsFormValidation(form, siteId, subsiteId) {
    $(form).validate({
        rules: {
            NumberOfMeasurements: { min: 1 }
        },
        messages: {
            NumberOfMeasurements: { min: "You must <a href='javascript:AddSubsiteMeasurement('" + siteId + "', '" + subsiteId + "')'>add a measurement</a> before moving to the next step." }
        }
    });
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
                                    AddSiteListSiteMeasurement(data.siteId, data.measurementId, data.genus, data.species, data.commonName);
                                    $('#' + siteId + '-NumberOfMeasurements').val(parseInt($('#' + siteId + '-NumberOfMeasurements').val()) + 1);
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
                                    UpdateSiteListSiteMeasurement(data.siteId, data.measurementId, data.genus, data.species, data.commonName);
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
                                $('#' + siteId + '-NumberOfMeasurements').val(parseInt($('#' + siteId + '-NumberOfMeasurements').val()) - 1);
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
                                    AddSiteListSubsiteMeasurement(data.siteId, data.subsiteId, data.measurementId, data.genus, data.species, data.commonName);
                                    $('#' + subsiteId + '-NumberOfMeasurements').val(parseInt($('#' + subsiteId + '-NumberOfMeasurements').val()) + 1);
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
                                    UpdateSiteListSubsiteMeasurement(data.siteId, data.subsiteId, data.measurementId, data.genus, data.species, data.commonName);
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
                                $('#' + subsiteId + '-NumberOfMeasurements').val(parseInt($('#' + subsiteId + '-NumberOfMeasurements').val()) - 1);
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
