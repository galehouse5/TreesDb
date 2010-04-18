<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportSubsiteModel>" %>
<div title="Edit subsite" class="dialog">
<form id="subsiteForm" method="post" action="">
    <%= Html.HiddenFor(m => m.Id) %>
    <%= Html.HiddenFor(m => m.SiteId) %>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.Name) %></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.Name)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
</form>
</div>
