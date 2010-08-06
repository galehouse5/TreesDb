<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='Placeholder'>
    <p>
        Are you sure you want to remove this trunk measurement?
    </p>
    <% Html.RenderPartial("TrunkMeasurementSummary", Model.SelectedTrunkMeasurement); %>
</div>