<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportModel>" %>
<div id='TrunkMeasurementRemover'>
    <div class='Placeholder'>
        <p>
            Are you sure you want to remove this trunk measurement?
        </p>
        <% Html.RenderPartial("TrunkMeasurementSummary", Model.SelectedTrunkMeasurement); %>
    </div>
</div>