<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportModel>" %>
<div id="SiteVisitRemover"">
    <div class="Placeholder">
        <p>
            Are you sure you want to remove this site visit?
        </p>
        <% Html.RenderPartial("SiteVisitSummary", Model.SelectedSiteVisit); %>
    </div>
</div>