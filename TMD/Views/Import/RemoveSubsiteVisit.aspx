<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='import-subsitevisit'>
    <p>
        Are you sure you want to remove this subsite visit?'
    </p>
    <% Html.RenderPartial("SubsiteVisitSummary", Model.SelectedSubsiteVisit); %>
</div>