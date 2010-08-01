<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.SubsiteVisit>" %>
<div class="ui-content-import-subsitevisit ui-widget ui-widget-content ui-corner-all">
    <div class="ui-content-import-header ui-widget-header ui-corner-all">
        <span class="ui-icon-import-subsitevisit"></span>
        <% if (true.Equals(ViewData["EditForSelectedSiteVisit"])) { %>
            <a href='javascript:SubsiteVisitEditor.Edit(<%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitEditor.Refresh, onShow: SiteVisitEditor.Show, onHide: SiteVisitEditor.Hide})' class="import-button-edit">Edit</a>
            <a href='javascript:SubsiteVisitRemover.Open(<%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitEditor.Refresh, onShow: SiteVisitEditor.Show, onHide: SiteVisitEditor.Hide})' class="import-button-remove">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitsEditor.Refresh})' class="import-button-edit">Edit</a>
            <a href='javascript:SubsiteVisitRemover.OpenForSiteVisit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitsEditor.Refresh})' class="import-button-remove">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["AddTreeMeasurements"])) { %>
            <a href='javascript:TreeMeasurementEditor.Add(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, TreeMeasurementsEditor.Refresh)' class="import-button-add-treemeasurement">Add measurement</a>
        <% } %>
        <% if (true.Equals(ViewData["Review"])) { %>
            <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, {onClose: ReviewEditor.Refresh})' class="import-button-edit">Edit</a>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <% if (true.Equals(ViewData["EditForSelectedSiteVisit"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "SelectedSiteVisit.SubsiteVisits[{0}]", 
                ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "SelectedSiteVisit.SubsiteVisits[{0}]",
                ViewData["SubsiteVisitIndex"]), "", new { @class = "ui-validation-error-message" })%>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Edit"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}]",
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}]", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), "", new { @class = "ui-validation-error-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["AddTreeMeasurements"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), "", new { @class = "ui-validation-error-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Review"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), "", new { @class = "ui-validation-error-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <div class="ui-content-import-summary ui-widget-content ui-corner-all">
        Name: <%= Model.Name%>
        <br />
        Location: <%= Model.County%>, <%= Model.State %>
        <br />
        Coordinates: <%= Model.Coordinates%>
    </div>
</div>
