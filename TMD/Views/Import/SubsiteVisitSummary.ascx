<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.SubsiteVisit>" %>
<div class="ImportSubsiteVisitSummary ui-widget ui-widget-content ui-corner-all">
    <div class="ImportEntitySummaryHeader ui-widget-header ui-corner-all">
        <span class="ImportSubsiteVisitIcon"></span>
        <% if (true.Equals(ViewData["EditForSelectedSiteVisit"])) { %>
            <a href='javascript:SubsiteVisitEditor.Edit(<%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitEditor.Refresh, onShow: SiteVisitEditor.Show, onHide: SiteVisitEditor.Hide})' class="ImportEditButton">Edit</a>
            <a href='javascript:SubsiteVisitRemover.Open(<%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitEditor.Refresh, onShow: SiteVisitEditor.Show, onHide: SiteVisitEditor.Hide})' class="ImportRemoveButton">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitsEditor.Refresh})' class="ImportEditButton">Edit</a>
            <a href='javascript:SubsiteVisitRemover.OpenForSiteVisit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, {onClose: SiteVisitsEditor.Refresh})' class="ImportRemoveButton">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["AddTreeMeasurements"])) { %>
            <a href='javascript:SingleTrunkTreeMeasurementEditor.Add(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, TreeMeasurementsEditor.Refresh)' class="ImportAddSingleTrunkTreeMeasurementButton">Add single trunk tree measurement</a>
            <br />
            <a href='javascript:MultiTrunkTreeMeasurementEditor.Add(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, TreeMeasurementsEditor.Refresh)' class="ImportAddMultiTrunkTreeMeasurementButton">Add multi trunk tree measurement</a>
        <% } %>
        <% if (true.Equals(ViewData["Review"])) { %>
            <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, {onClose: ReviewEditor.Refresh})' class="ImportEditButton">Edit</a>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <% if (true.Equals(ViewData["EditForSelectedSiteVisit"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "SelectedSiteVisit.SubsiteVisits[{0}]", 
                ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "SelectedSiteVisit.SubsiteVisits[{0}]",
                ViewData["SubsiteVisitIndex"]), "", new { @class = "ValidationErrorMessage" })%>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Edit"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}]",
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}]", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), "", new { @class = "ValidationErrorMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["AddTreeMeasurements"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), "", new { @class = "ValidationErrorMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Review"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"]), "", new { @class = "ValidationErrorMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <div class="ImportEntitySummary ui-widget-content ui-corner-all">
        <% if (string.IsNullOrWhiteSpace(Model.Name)) { %>
            (name not entered)
        <% } else {%>
            <%= Model.Name %>
        <% } %>
        <br />
        <%= Model.County%>, <%= Model.State %>
        <br />
        <% if (Model.Coordinates.IsSpecified && Model.Coordinates.IsValid) { %>
            <% if (Model.CoordinatesCalculatedFromContainingSiteVisit) { %>
                Coordinates estimated from site
            <% } else if (Model.CoordinatesCalculatedFromContainedTreeMeasurements) { %>
                Coordinates estimated from trees 
            <% } else { %>
                Coordinates entered
            <% } %>
        <% } else { %>
            Coordinates unknown
        <% } %>
    </div>
</div>
