function InitializeSiteFormValidation() {
    $('#siteForm').validate({
        rules: {
            Name: { TMDAlways: true, maxlength: 100, required: true },
            County: { TMDAlways: true, maxlength: 100, required: true },
            State: { TMDAlways: true, required: true },
            OwnershipType: { TMDAlways: true, maxlength: 100, required: true },
            OwnershipContactInfo: { TMDAlways: true, maxlength: 200 },
            SiteComments: { TMDAlways: true, maxlength: 300 }
        }
    });
}

function InitializeSubsiteFormValidation() {
    $('#subsiteForm').validate({
        rules: {
            Name: { TMDAlways: true, maxlength: 100, required: true }
        }
    });
}

function InitializeMeasurementFormValidation() {
    $('#measurementForm').validate({
        rules: {
            Genus: { TMDAlways: true, required: true, maxlength: 100 },
            Species: { TMDAlways: true, required: true, maxlength: 100 },
            CommonName: { TMDAlways: true, required: true, maxlength: 100 }
        }
    });
}

function UpdateSiteListSite(siteId, siteName) {
    $('#SiteList #' + siteId + ' > div > span.Name').html(siteName);
}

function EditSite(siteId) {
    $.get('/Import/EditSiteDialog',
        { siteId: siteId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 500,
                buttons: {
                    'Save': function () {
                        if ($('#siteForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveEditSiteDialog',
                                $('#siteForm').serialize(),
                                function (data) {
                                    UpdateSiteListSite(data.siteId, data.siteName);
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
            InitializeSiteFormValidation();
            $('#Name').focus();
        });
}

function UpdateSiteListSubsite(siteId, subsiteId, subsiteName) {
    $('#SiteList #' + siteId + ' #' + subsiteId + ' span.Name').html(subsiteName);
}

function EditSubsite(siteId, subsiteId) {
    $.get('/Import/EditSubsiteDialog',
        { siteId: siteId, subsiteId: subsiteId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 300,
                buttons: {
                    'Save': function () {
                        if ($('#subsiteForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveEditSubsiteDialog',
                                $('#subsiteForm').serialize(),
                                function (data) {
                                    UpdateSiteListSubsite(data.siteId, data.subsiteId, data.subsiteName);
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
            InitializeSubsiteFormValidation();
            $('#Name').focus();
        });
}

function UpdateSiteListSiteMeasurement(siteId, measurementId, genus, species, commonName) {
    $('#SiteList #' + siteId + ' #' + measurementId + ' span.Genus').html(genus);
    $('#SiteList #' + siteId + ' #' + measurementId + ' span.Species').html(species);
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

function UpdateSiteListSubsiteMeasurement(siteId, subsiteId, measurementId, genus, species, commonName) {
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId + ' span.Genus').html(genus);
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId + ' span.Species').html(species);
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