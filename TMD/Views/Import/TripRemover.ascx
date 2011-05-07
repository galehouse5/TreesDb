<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportsModel>" %>
<div id="TripRemover"">
    <div class="Placeholder">
        <p>
            Are you sure you want to remove this trip?
        </p>
        <% Html.RenderPartial("TripSummary", Model.SelectedTrip); %>
    </div>
</div>
