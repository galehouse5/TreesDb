<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.TrunkMeasurement>" %>
<div class="ImportTrunkMeasurementSummary ui-widget ui-widget-content ui-corner-all">
    <div class="ImportEntitySummaryHeader ui-widget-header ui-corner-all">
        <span class="ImportTrunkMeasurementIcon"></span>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <a href='javascript:TrunkMeasurementEditor.Edit(<%= ViewData["TrunkMeasurementIndex"] %>, {onClose: MultiTrunkTreeMeasurementEditor.Refresh})' class="ImportEditButton">Edit</a>
            <a href='javascript:TrunkMeasurementRemover.Open(<%= ViewData["TrunkMeasurementIndex"] %>, {onClose: MultiTrunkTreeMeasurementEditor.Refresh})' class="ImportRemoveButton">Remove</a>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <% if (true.Equals(ViewData["Edit"])) { %>
        <div class="ValidationError ui-state-error-text">
            <%= Html.ValidationMessage(string.Format(
                "SelectedTreeMeasurement.TrunkMeasurements[{0}]",
                ViewData["TrunkMeasurementIndex"]), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
            <%= Html.ValidationMessage(string.Format(
                "SelectedTreeMeasurement.TrunkMeasurements[{0}]", 
                ViewData["TrunkMeasurementIndex"]), "", new { @class = "ValidationErrorMessage" })%>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <div class="ImportEntitySummary ui-widget-content ui-corner-all">
        <% if (Model.Height.IsValidAndSpecified) { %>
            <%= Model.Height %> height
            <br />
        <% } else if (Model.HeightMeasurements.IsValidAndSpecified) { %>
            <%= Model.HeightMeasurements.Height %> height
            <br />
        <% } %>
        <% if (Model.Girth.IsValidAndSpecified) { %>
            <%= Model.Girth %> girth
        <% } %>
    </div>
</div>

