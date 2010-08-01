<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.SiteVisit>" %>
<div class="ui-content-import-sitevisit ui-widget ui-widget-content ui-corner-all">
    <div class="ui-content-import-header ui-widget-header ui-corner-all">
        <span class="ui-icon-import-sitevisit"></span>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <a href='javascript:SiteVisitEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, {onClose: SiteVisitsEditor.Refresh})' class="import-button-edit">Edit</a>
            <a href='javascript:SiteVisitRemover.Open(<%= ViewData["SiteVisitIndex"] %>, SiteVisitsEditor.Refresh)' class="import-button-remove">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["Review"])) { %>
            <a href='javascript:SiteVisitEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, {onClose: ReviewEditor.Refresh, disableSubsiteVisitAdding: true})' class="import-button-edit">Edit</a>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <% if (true.Equals(ViewData["Edit"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}]", 
                ViewData["SiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}]", 
                ViewData["SiteVisitIndex"]), "", new { @class = "ui-validation-error-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Review"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].Coordinates", 
                ViewData["SiteVisitIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].Coordinates", 
                ViewData["SiteVisitIndex"]), "", new { @class = "ui-validation-error-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <div class="ui-content-import-summary ui-widget-content ui-corner-all">
        Name: <%= Model.Name %>
        <br />
        Coordinates: <%= Model.Coordinates %>
    </div>
</div>
