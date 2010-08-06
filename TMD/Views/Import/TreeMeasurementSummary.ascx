<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.TreeMeasurementBase>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div class="ImportTreeMeasurementSummary ui-widget ui-widget-content ui-corner-all">
    <div class="ImportEntitySummaryHeader ui-widget-header ui-corner-all">
        <% if (Model is SingleTrunkTreeMeasurement) { %>
            <span class="ImportSingleTrunkTreeMeasurementIcon"></span>
        <% } else if (Model is MultiTrunkTreeMeasurement) { %>
            <span class="ImportMultiTrunkTreeMeasurementIcon"></span>
        <% } %>
        <% if (Model.TreeNumber != null || true.Equals(ViewData["IncludeTreeNumber"])) { %>
            <%= Model.TreeNumber %>
        <% } %>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <% if (Model is SingleTrunkTreeMeasurement) { %>
                <a href='javascript:SingleTrunkTreeMeasurementEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, TreeMeasurementsEditor.Refresh)' class="ImportEditButton">Edit</a>
                <a href='javascript:SingleTrunkTreeMeasurementRemover.Open(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, TreeMeasurementsEditor.Refresh)' class="ImportRemoveButton">Remove</a>
            <% } else if (Model is MultiTrunkTreeMeasurement) { %>
                <a href='javascript:MultiTrunkTreeMeasurementEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, TreeMeasurementsEditor.Refresh)' class="ImportEditButton">Edit</a>
                <a href='javascript:MultiTrunkTreeMeasurementRemover.Open(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, TreeMeasurementsEditor.Refresh)' class="ImportRemoveButton">Remove</a>
            <% } %>            
        <% } %>
        <% if (true.Equals(ViewData["Review"])) { %>
            <% if (Model is SingleTrunkTreeMeasurement) { %>
                <a href='javascript:SingleTrunkTreeMeasurementEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, ReviewEditor.Refresh)' class="ImportEditButton">Edit</a>
            <% } else if (Model is MultiTrunkTreeMeasurement) { %>
                <a href='javascript:MultiTrunkTreeMeasurementEditor.Edit(<%= ViewData["SiteVisitIndex"] %>, <%= ViewData["SubsiteVisitIndex"] %>, <%= ViewData["TreeMeasurementIndex"] %>, ReviewEditor.Refresh)' class="ImportEditButton">Edit</a>
            <% } %>  
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <% if (true.Equals(ViewData["Edit"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), "", new { @class = "ValidationErrorMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <% if (true.Equals(ViewData["Review"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), "", new { @class = "ValidationErrorMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ValidationWarning ui-state-active">
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates.Warning",  
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), " ", new { @class = "ui-icon ui-icon-alert" })%>
            <%= Html.ValidationMessage(string.Format(
                "Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates.Warning", 
                ViewData["SiteVisitIndex"], ViewData["SubsiteVisitIndex"], ViewData["TreeMeasurementIndex"]), "", new { @class = "ValidationWarningMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <div class="ImportEntitySummary ui-widget-content ui-corner-all">
        <% if (Model.TreeNameSpecified) { %>
           <%= Model.TreeName %>
           <br />
        <% } %>
        <% if (string.IsNullOrWhiteSpace(Model.ScientificName)) { %>
            (scientific name not entered)
        <% } else { %>
            <%= Model.ScientificName %> (<%= Model.CommonName %>)
        <% } %>
        <% if (Model.Height.IsValidAndSpecified) { %>
            <br />
            <%= Model.Height %> height
        <% } else if (Model.HeightMeasurements.IsValidAndSpecified) { %>
            <br />
            <%= Model.HeightMeasurements.Height%> height
        <% } %>
        <% if (Model.Girth.IsValidAndSpecified) { %>
            <br />
            <%= Model.Girth %> girth
        <% } %>
        <% if (Model.CrownSpread.IsValidAndSpecified) { %>
            <br />
            <%= Model.CrownSpread%> crown spread
        <% } %>
        <br />
        <% if (Model.Coordinates.IsSpecified && Model.Coordinates.IsValid) { %>
            <% if (Model.CoordinatesCalculatedFromContainingSubsiteVisit) { %>
                Coordinates estimated from subsite
            <% } else { %>
                Coordinates entered
            <% } %>
        <% } else { %>
            Coordinates unknown
        <% } %>        
    </div>
</div>