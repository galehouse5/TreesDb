<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='import-sitevisit'>
    <p>
        Are you sure you want to remove this site visit?
    </p>
    <% Html.RenderPartial("SiteVisitSummary", Model.SelectedSiteVisit); %>
</div>