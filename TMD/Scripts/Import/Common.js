// Start
var importIconPaths = [
    "/Styles/Images/checked.gif",
    "/Styles/Images/unchecked.gif",
    "/Styles/Images/tree.png",
    "/Styles/Images/site.png",
    "/Styles/Images/subsite.png",
    "/Styles/ThirdParty/smoothness/images/ui-bg_glass_75_e6e6e6_1x400.png"];

function PreloadImportIcons() {
    for (i in importIconPaths) {
        var importIcon = new Image();
        importIcon.src = importIconPaths[i];
    }   
}

// TripInfo
function InitializeTripFormValidation() {
    $('#tripForm').validate({
        rules: {
            Name: { TMDAlways: true, maxlength: 100 },
            Date: { TMDAlways: true, TMDDate: true },
            Website: { TMDAlways: true, maxlength: 100 },
            MeasurerContactInfo: { TMDAlways: true, required: true, maxlength: 200 },
            PhotosAvailable: { TMDAlways: true }
        }
    });
}

// SiteInfo
function DeleteSite(siteId) {
    $.get("/Import/DeleteSiteDialog",
            { siteId: siteId },
            function (data) {
                $(data).dialog({ resizable: false, modal: true,
                    buttons: {
                        'Delete': function () {
                            ConfirmDeleteSite(this, siteId);
                        },
                        'Cancel': function () {
                            $(this).dialog('destroy').remove();
                        }
                    },
                    close: function() {
                        $(this).dialog('destroy').remove();
                    }
                });
            });
}

function ConfirmDeleteSite(dialog, siteId) {
    $.post("/Import/ConfirmDeleteSite",
            { siteId: siteId },
            function (data) {
                $('#NumberOfSites').val(parseInt($('#NumberOfSites').val()) - 1);
                RemoveSiteListSite(siteId);
                $(dialog).dialog('destroy').remove();
            });
}

function DeleteSubsite(siteId, subsiteId) {
    $.get("/Import/DeleteSubsiteDialog",
            { siteId: siteId, subsiteId: subsiteId },
            function (data) {
                $(data).dialog({ resizable: false, modal: true,
                    buttons: {
                        'Delete': function () {
                            ConfirmDeleteSubsite(this, siteId, subsiteId);
                        },
                        'Cancel': function () {
                            $(this).dialog('destroy').remove();
                        }
                    },
                    close: function() {
                        $(this).dialog('destroy').remove();
                    }
                });
            });
}

function ConfirmDeleteSubsite(dialog, siteId, subsiteId) {
    $.post("/Import/ConfirmDeleteSubsite",
            { siteId: siteId, subsiteId: subsiteId },
            function (data) {
                RemoveSiteListSubsite(siteId, subsiteId);
                $(dialog).dialog('destroy').remove();
            });
}

function InitializeSitesFormValidation() {
    $('#sitesForm').validate({
        rules: {
            NumberOfSites: { min: 1 }
        },
        messages: {
            NumberOfSites: { min: "You must <a href='javascript:AddSite()'>add a site</a> before moving to the next step." }
        }
    });
}

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

function AddSite() {
    $.get('/Import/AddSiteDialog',
        {},
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 500,
                buttons: {
                    'Save': function () {
                        if ($('#siteForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveAddSiteDialog',
                                $('#siteForm').serialize(),
                                function (data) {
                                    $('#NumberOfSites').val(parseInt($('#NumberOfSites').val()) + 1);
                                    $('#sitesForm').validate().resetForm();
                                    AddSiteListSite(data.siteId, data.siteName);
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

function AddSubsite(siteId) {
    $.get('/Import/AddSubsiteDialog',
        { siteId: siteId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 640, height: 300,
                buttons: {
                    'Save': function () {
                        if ($('#subsiteForm').valid()) {
                            var dialog = $(this);
                            $.post('/Import/SaveAddSubsiteDialog',
                                $('#subsiteForm').serialize(),
                                function (data) {
                                    AddSiteListSubsite(data.siteId, data.subsiteId, data.subsiteName);
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