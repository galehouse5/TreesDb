<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div id='TreeMeasurementRemoverPlaceholder'>
    <p>
        Are you sure you want to remove this tree measurement?
    </p>
    <% Html.RenderPartial("TreeMeasurementSummary", 
           Model.SelectedTreeMeasurement); %>
</div>