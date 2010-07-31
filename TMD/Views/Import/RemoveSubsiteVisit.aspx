<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='import-subsitevisit'>
    <p>
        Are you sure you want to remove this subsite visit?'
    </p>
    <div class="ui-content-import-subsitevisit ui-widget ui-widget-content ui-corner-all">
        <div class="ui-content-import-header ui-widget-header ui-corner-all">
            <span class="ui-icon-import-subsitevisit"></span>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ui-content-import-summary ui-widget-content ui-corner-all">
            Name: <%= Model.SelectedSubsiteVisit.Name %>
            <br />
            Location: <%= Model.SelectedSubsiteVisit.County%>, <%= Model.SelectedSubsiteVisit.State%>
            <br />
            Coordinates: <%= Model.SelectedSubsiteVisit.Coordinates%>
        </div>
        <div class="ui-helper-clearfix"></div>
    </div>
</div>