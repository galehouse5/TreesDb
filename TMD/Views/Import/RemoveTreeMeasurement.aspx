<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class='ui-placeholder-import-treemeasurement'>
    <p>
        Are you sure you want to remove this tree measurement?
    </p>
    <div class="ui-content-import-treemeasurement ui-widget ui-widget-content ui-corner-all">
        <div class="ui-content-import-header ui-widget-header ui-corner-all">
            <span class="ui-icon-import-treemeasurement"></span>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ui-content-import-summary ui-widget-content ui-corner-all">
            <% if (Model.SelectedTreeMeasurement.TreeNameSpecified) { %>
               Name : <%= Model.SelectedTreeMeasurement.TreeName%>
               <br />
            <% } %>
            Common name: <%= Model.SelectedTreeMeasurement.CommonName%>
            <br />
            Scientific name: <%= Model.SelectedTreeMeasurement.ScientificName%>
            <br />
            Coordinates: <%= Model.SelectedTreeMeasurement.Coordinates%>
        </div>
        <div class="ui-helper-clearfix"></div>
    </div>
</div>