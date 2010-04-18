<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportSiteModel>" %>
<div title="Add site" class="dialog">
<form id="siteForm" method="post" action="">
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.Name) %></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.Name)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.County) %></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.County)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.State) %></div>
        <div class="form-col-normal"><%= Html.DropDownListFor(m => m.State, Model.ListKnownStateCodes()) %></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.OwnershipType) %></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.OwnershipType)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.OwnershipContactInfo) %></div>
        <div class="form-col-normal"><%= Html.CustomTextAreaFor(m => m.OwnershipContactInfo, 4, 50, null)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.SiteComments) %></div>
        <div class="form-col-normal"><%= Html.CustomTextAreaFor(m => m.SiteComments, 6, 50, null)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
</form>
</div>
