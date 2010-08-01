<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.TreeMeasurement>" %>
<div class="ui-content-import-treemeasurement ui-widget ui-widget-content ui-corner-all">
    <div class="ui-content-import-header ui-widget-header ui-corner-all">
        <span class="ui-icon-import-treemeasurement"></span>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <a href='javascript:TreeMeasurementEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, TreeMeasurementsEditor.Refresh)' class="import-button-edit">Edit</a>
            <a href='javascript:TreeMeasurementRemover.Open(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, TreeMeasurementsEditor.Refresh)' class="import-button-remove">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["Review"])) { %>
            <a href='javascript:TreeMeasurementEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, ReviewEditor.Refresh)' class="import-button-edit">Edit</a>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <% if (true.Equals(ViewData["Edit"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), "", new { @class = "ui-validation-error-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Review"])) { %>
        <div class="ui-validation-error ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), "", new { @class = "ui-validation-error-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ui-validation-warning ui-state-active">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates.Warning",  
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), " ", new { @class = "ui-icon ui-icon-alert" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates.Warning", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), "", new { @class = "ui-validation-warning-message" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <div class="ui-content-import-summary ui-widget-content ui-corner-all">
        <% if (true.Equals(ViewData["IncludeTreeNumber"])) { %>
            Tree number: <%= Model.TreeNumber %>
            <br />
        <% } %>
        <% if (Model.TreeNameSpecified) { %>
           Name : <%= Model.TreeName %>
           <br />
        <% } %>
        Common name: <%= Model.CommonName %>
        <br />
        Scientific name: <%= Model.ScientificName %>
        <br />
        Coordinates: <%= Model.Coordinates %>
        <% if (Model.CoordinatesCalculatedFromContainingSubsiteVisit) { %>
            <br />
            (calculated from containing subsite)
        <% } %>
    </div>
</div>