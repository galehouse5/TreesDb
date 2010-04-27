<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportMeasurementModel>" %>
<div title="Add measurement to <%= Model.SiteName %>" class="dialog">
<form id="measurementForm" method="post" action="">
    <%= Html.HiddenFor(m => m.SiteId) %>
    <%= Html.HiddenFor(m => m.Id) %>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.CommonName) %></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.CommonName)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.ScientificName) %></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.ScientificName)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
</form>
</div>
