function InitializeSiteFormValidation() {
    $('#siteForm').validate({
        rules: {
            Name: { TMDAlways: true, maxlength: 100, required: true },
            County: { TMDAlways: true, maxlength: 100, required: true },
            State: { TMDAlways: true, required: true },
            SiteComments: { TMDAlways: true, maxlength: 300 },
            OwnershipType: { TMDAlways: true, maxlength: 100, required: true },
            OwnershipContactInfo: { TMDAlways: true, maxlength: 200 }
        },
        invalidHandler: function (form, validator) {
            var firstInvalidElement = $(validator.errorList[0].element);
            var accordionTabHeader = firstInvalidElement.parents('.ui-accordion-content').prev();
            $('.accordion').accordion('activate', accordionTabHeader);
            firstInvalidElement.focus();
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

function InitializeSitesFormValidation() {
    $('#sitesForm').validate({
        rules: {
            NumberOfSites: { min: 1 }
        },
        messages: {
            NumberOfSites: { min: "You must <a href='javascript:AddSite()'>add a site</a> before moving on." }
        }
    });
}

function AddSiteListSite(siteId, siteName) {
    var siteDom = $('\
        <li id="' + siteId + '" class="Site">\
            <span class="Icon"></span>\
            <div class="Column">\
                <span class="Name">' + siteName + '</span>\
                <br />\
                <a href="javascript:AddSubsite(\'' + siteId + '\')">Add subsite</a>\
                <a href="javascript:EditSite(\'' + siteId + '\')">Edit</a>\
                <a href="javascript:DeleteSite(\'' + siteId + '\')">Delete</a>\
            </div>\
            <div class="ui-helper-clearfix"></div>\
            <ul class="SubsiteList"></ul>\
        </li>');
    $('#SiteList').prepend(siteDom);
}

function AddSite() {
    $.get('/Import/AddSiteDialog',
        {},
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 800, height: 600,
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
            var map = InitializeLocationPicker();
            $(".accordion").accordion({
                fillSpace: true,
                change: function (event, ui) {
                    google.maps.event.trigger(map, 'resize')
                }
            });
            InitializeSiteFormValidation();
            $('#Name').focus();
        });
}

function InitializeLocationPicker() {
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControlOptions: {
            mapTypeIds: [ google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.HYBRID ]
        }
    };
    var map = new google.maps.Map(document.getElementById("locationMap"), myOptions);

    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        draggable: true
    });

    google.maps.event.addListener(marker, 'dragend', function (mouseEvent) {
        map.setCenter(marker.position);
    });

    return map;
}

function UpdateSiteListSite(siteId, siteName) {
    $('#SiteList #' + siteId + ' > div > span.Name').html(siteName);
}

function EditSite(siteId) {
    $.get('/Import/EditSiteDialog',
        { siteId: siteId },
        function (data) {
            $(data).dialog({ resizable: false, modal: true, width: 700, height: 500,
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
            $(".accordion").accordion({
                fillSpace: true
            });
            InitializeSiteFormValidation();
            $('#Name').focus();
        });
}

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
                    close: function () {
                        $(this).dialog('destroy').remove();
                    }
                });
            });
}

function RemoveSiteListSite(siteId) {
    $('#SiteList #' + siteId).remove();
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

function AddSiteListSubsite(siteId, subsiteId, subsiteName) {
    var subsiteDom = $('\
        <li id="' + subsiteId + '" class="Subsite">\
            <span class="Icon"></span>\
            <div class="Column">\
                <span class="Name">' + subsiteName + '</span>\
                <br />\
                <a href="javascript:EditSubsite(\'' + siteId + '\', \'' + subsiteId + '\')">Edit</a>\
                <a href="javascript:DeleteSubsite(\'' + siteId + '\', \'' + subsiteId + '\')">Delete</a>\
            </div>\
            <div class="ui-helper-clearfix"></div>\
        </li>');
    $('#SiteList #' + siteId + ' ul.SubsiteList').prepend(subsiteDom);
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
                    close: function () {
                        $(this).dialog('destroy').remove();
                    }
                });
            });
}

function RemoveSiteListSubsite(siteId, subsiteId, subsiteName) {
    $('#SiteList #' + siteId + ' #' + subsiteId).remove();
}

function ConfirmDeleteSubsite(dialog, siteId, subsiteId) {
    $.post("/Import/ConfirmDeleteSubsite",
        { siteId: siteId, subsiteId: subsiteId },
        function (data) {
            RemoveSiteListSubsite(siteId, subsiteId);
            $(dialog).dialog('destroy').remove();
        });
}

$(document).ready(function () {
    InitializeSitesFormValidation();
    $('.wizard a').click(function () {
        if (!$(this).hasClass('advance') || $('#sitesForm').valid()) {
            return true;
        } else {
            return false;
        }
    });
});









