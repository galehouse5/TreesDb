<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='subsitevisit-placeholder'>
    <p>
        <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;">
        </span>
        Are you sure you want to remove your visit to <%= Model.SelectedSubsiteVisit.Name %>?
    </p>
</div>