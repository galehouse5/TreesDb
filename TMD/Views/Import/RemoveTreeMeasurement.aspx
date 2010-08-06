<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='Placeholder'>
    <p>
        Are you sure you want to remove this tree measurement?
    </p>
    <% Html.RenderPartial("TreeMeasurementSummary", Model.SelectedTreeMeasurement); %>
</div>