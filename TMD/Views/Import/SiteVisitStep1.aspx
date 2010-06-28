<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div class="sitevisit-placeholder">
    <form method="post" action="">
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSiteVisit.Name)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedSiteVisit.Name)%><%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Name)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-selector">
            Pick rough coordinates for this site to simplify remaining steps? <%= Html.CheckBoxFor(m => m.SelectedSiteVisit.CoordinatesEntered)%>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-visible">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSiteVisit.Coordinates.Latitude)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedSiteVisit.Coordinates.Latitude, new { @class = "sitevisit-latitude" })%><%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Latitude)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-visible">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSiteVisit.Coordinates.Longitude)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedSiteVisit.Coordinates.Longitude, new { @class = "sitevisit-longitude" })%><%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Longitude)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-visible">
            <div class="form-col-brief">&nbsp;</div>
            <div class="form-col-brief"><a href="javascript:SiteVisitEditor.OpenCoordinatePicker()">Use coordinate picker</a></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSiteVisit.Comments)%></div>
            <div class="form-col-normal"><%= Html.TextAreaFor(m => m.SelectedSiteVisit.Comments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Comments)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </form>
</div>