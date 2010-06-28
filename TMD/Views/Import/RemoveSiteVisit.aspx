<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='sitevisit-placeholder'>
    <p>
        <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;">
        </span>
        Are you sure you want to remove your visit to <%= Model.Trip.SiteVisits[Model.SelectedSiteVisitIndex].Name %>?
    </p>
</div>