<%@ Page Title="Tree Measurement Database - Import Trip Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/TripEditor.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<div class="trip-placeholder">
    <h3>Enter general information about your trip.</h3>
    <div class="sectionspacer"></div>
    <form method="post" action="">
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.Trip.Name) %></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.Trip.Name)%><%= Html.ValidationMessageFor(m => m.Trip.Name)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.Trip.Date)%></div>
            <div class="form-col-normal"><%= Html.EditorFor(m => m.Trip.Date)%><%= Html.ValidationMessageFor(m => m.Trip.Date)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.Trip.MeasurerContactInfo)%></div>
            <div class="form-col-normal"><%= Html.TextAreaFor(m => m.Trip.MeasurerContactInfo, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.Trip.MeasurerContactInfo)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.Trip.Website)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.Trip.Website)%><%= Html.ValidationMessageFor(m => m.Trip.Website)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.Trip.PhotosAvailable)%></div>
            <div class="form-col-normal"><%= Html.CheckBoxFor(m => m.Trip.PhotosAvailable)%><%= Html.ValidationMessageFor(m => m.Trip.PhotosAvailable)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </form>
    <div class="sectionspacer"></div>
</div>
</asp:Content>

<asp:Content ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "SiteVisits", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "Start", null, new { @class = "retreat" })%>
</asp:Content>
