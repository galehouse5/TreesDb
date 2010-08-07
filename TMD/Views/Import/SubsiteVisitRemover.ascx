<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportModel>" %>
<div id="SubsiteVisitRemover">
    <div class="Placeholder">
        <p>
            Are you sure you want to remove this subsite visit?'
        </p>
        <% Html.RenderPartial("SubsiteVisitSummary", Model.SelectedSubsiteVisit); %>
    </div>
</div>