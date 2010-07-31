<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='import-sitevisit'>
    <p>
        Are you sure you want to remove this site visit?
    </p>
    <div class="ui-content-import-sitevisit ui-widget ui-widget-content ui-corner-all">
        <div class="ui-content-import-header ui-widget-header ui-corner-all">
            <span class="ui-icon-import-sitevisit"></span>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ui-content-import-summary ui-widget-content ui-corner-all">
            Name: <%= Model.SelectedSiteVisit.Name%>
            <br />
            Coordinates: <%= Model.SelectedSiteVisit.Coordinates%>
        </div>
        <div class="ui-helper-clearfix"></div>
    </div>
</div>