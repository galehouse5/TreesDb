<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportSiteModel>" %>
<div title="Delete site?" class="dialog">
    <p>
        <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;">
        </span>
        Are you sure you want to delete <%= Model.Name %>?
    </p>
</div>
