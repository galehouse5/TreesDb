// Start
var importIconPaths = [
    "/Styles/Images/checked.gif",
    "/Styles/Images/unchecked.gif",
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
function buildListSiteDom(siteId, siteName) {
    var siteDom = $('\
        <li id="' + siteId + '" class="site">\
        <span class="icon"></span>\
        <div>\
            <span class="name">' + siteName + '</span>\
            <br />\
            <a href="javascript:AddSubsite(\'' + siteId + '\')">Add subsite</a>\
            <a href="javascript:EditSite(\'' + siteId + '\')">Edit</a>\
            <a href="javascript:DeleteSite(\'' + siteId + '\')">Delete</a>\
        </div>\
            <ul class="subsites">\
            </ul>\
        </li>');
    return siteDom;
}

function buildListSubsiteDom(siteId, subsiteId, subsiteName) {
    var subsiteDom = $('\
        <li id="' + subsiteId + '" class="subsite">\
            <span class="icon"></span>\
                <div>\
                    <span class="name">' + subsiteName + '</span>\
                    <br />\
                    <a href="javascript:EditSubsite(\'' + siteId + '\', \'' + subsiteId + '\')">Edit</a>\
                    <a href="javascript:DeleteSubsite(\'' + siteId + '\', \'' + subsiteId + '\')">Delete</a>\
                </div>\
        </li>');
    return subsiteDom;
}

function DeleteSite(siteId) {
    $.get("/Import/DeleteSiteDialog/",
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
                $('#' + siteId).remove();
                $(dialog).dialog('destroy').remove();
            });
}

function DeleteSubsite(siteId, subsiteId) {
    $.get("/Import/DeleteSubsiteDialog/",
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
                $('#' + subsiteId).remove();
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
                                    $('ul.sites').prepend(buildListSiteDom(data.siteId, data.siteName));
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
                                    $('#' + siteId + ' ul').prepend(buildListSubsiteDom(data.siteId, data.subsiteId, data.subsiteName));
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
                                    $('#' + data.siteId).find('.name').html(data.siteName);
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
                                    $('#' + data.subsiteId).find('.name').html(data.subsiteName);
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