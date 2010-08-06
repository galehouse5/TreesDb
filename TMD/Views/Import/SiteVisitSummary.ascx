<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.SiteVisit>" %>
<div class="ImportSiteVisitSummary ui-widget ui-widget-content ui-corner-all">
    <div class="ImportEntitySummaryHeader ui-widget-header ui-corner-all">
        <span class="ImportSiteVisitIcon"></span>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <a href='javascript:SiteVisitEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, {onClose: SiteVisitsEditor.Refresh})' class="ImportEditButton">Edit</a>
            <a href='javascript:SiteVisitRemover.Open(<%= ViewData["SiteVisitIndex"] %>, SiteVisitsEditor.Refresh)' class="ImportRemoveButton">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["Review"])) { %>
            <a href='javascript:SiteVisitEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, {onClose: ReviewEditor.Refresh, disableSubsiteVisitAdding: true})' class="ImportEditButton">Edit</a>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <% if (true.Equals(ViewData["Edit"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}]", 
                ViewData["SiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}]", 
                ViewData["SiteVisitIndex"]), "", new { @class = "ValidationErrorMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Review"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].Coordinates", 
                ViewData["SiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].Coordinates", 
                ViewData["SiteVisitIndex"]), "", new { @class = "ValidationErrorMessage" })%>
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
        <% if (Model.Coordinates.IsSpecified && Model.Coordinates.IsValid) { %>
            <% if (Model.CoordinatesCalculatedFromContainedSubsiteVisits) { %>
                Coordinates estimated from subsites
            <% } else { %>
                Coordinates entered
            <% } %>
        <% } else { %>
            Coordinates unknown
        <% } %>
    </div>
</div>
