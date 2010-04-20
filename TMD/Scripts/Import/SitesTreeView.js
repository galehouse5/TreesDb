function AddSiteListSite(siteId, siteName) {
    var siteDom = $('\
        <li id="' + siteId + '" class="Site">\
            <span class="Icon"></span>\
            <div>\
                <span class="Name">' + siteName + '</span>\
                <br />\
                <a href="javascript:AddSubsite(\'' + siteId + '\')">Add subsite</a>\
                <a href="javascript:EditSite(\'' + siteId + '\')">Edit</a>\
                <a href="javascript:DeleteSite(\'' + siteId + '\')">Delete</a>\
            </div>\
            <ul class="MeasurementList"></ul>\
            <ul class="SubsiteList"></ul>\
        </li>');
    $('#SiteList').prepend(siteDom);
}

function UpdateSiteListSite(siteId, siteName) {
    $('#SiteList #' + siteId + ' span.Name').html(siteName);
}

function RemoveSiteListSite(siteId) {
    $('#SiteList #' + siteId).remove();
}

function AddSiteListSiteMeasurement(siteId, measurementId, genus, species, commonName) {
    var measurementDom = $('\
        <li id="' + measurementId + '" class="Measurement">\
            <span class="Icon"></span>\
            <div class="Column">\
                <span class="Genus">' + genus + '</span>\
                <span class="Species">' + species + '</span>\
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

function UpdateSiteListSiteMeasurement(siteId, measurementId, genus, species, commonName) {
    $('#SiteList #' + siteId + ' #' + measurementId + ' span.Genus').html(genus);
    $('#SiteList #' + siteId + ' #' + measurementId + ' span.Species').html(species);
    $('#SiteList #' + siteId + ' #' + measurementId + ' span.CommonName').html(commonName);
}

function RemoveSiteListSiteMeasurement(siteId, measurementId) {
    $('#SiteList #' + siteId + ' #' + measurementId).remove();
}

function AddSiteListSubsite(siteId, subsiteId, subsiteName) {
    var subsiteDom = $('\
        <li id="' + subsiteId + '" class="subsite">\
            <span class="Icon"></span>\
            <div>\
                <span class="Name">' + subsiteName + '</span>\
                <br />\
                <a href="javascript:EditSubsite(\'' + siteId + '\', \'' + subsiteId + '\')">Edit</a>\
                <a href="javascript:DeleteSubsite(\'' + siteId + '\', \'' + subsiteId + '\')">Delete</a>\
            </div>\
            <ul class="MeasurementList"></ul>\
        </li>');
    $('#SiteList #' + siteId + ' ul.SubsiteList').prepend(subsiteDom);
}

function UpdateSiteListSubsite(siteId, subsiteId, subsiteName) {
    $('#SiteList #' + siteId + ' #' + subsiteId + ' span.Name').html(subsiteName);
}

function RemoveSiteListSubsite(siteId, subsiteId, subsiteName) {
    $('#SiteList #' + siteId + ' #' + subsiteId).remove();
}

function AddSiteListSubsiteMeasurement(siteId, subsiteId, measurementId, genus, species, commonName) {
    var measurementDom = $('\
        <li id="' + measurementId + '" class="Measurement">\
            <span class="Icon"></span>\
            <div class="Column">\
                <span class="Genus">' + genus + '</span>\
                <span class="Species">' + species + '</span>\
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

function UpdateSiteListSubsiteMeasurement(siteId, subsiteId, measurementId, genus, species, commonName) {
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId + ' span.Genus').html(genus);
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId + ' span.Species').html(species);
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId + ' span.CommonName').html(commonName);
}

function RemoveSiteListSubsiteMeasurement(siteId, subsiteId, measurementId) {
    $('#SiteList #' + siteId + ' #' + subsiteId + ' #' + measurementId).remove();
}