<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportModel>" %>
<div id="TreeMeasurementRemover">
    <div class='Placeholder'>
        <p>
            Are you sure you want to remove this tree measurement?
        </p>
        <% Html.RenderPartial("TreeMeasurementSummary", Model.SelectedTreeMeasurement); %>
    </div>
</div>