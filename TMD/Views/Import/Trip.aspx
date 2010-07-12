<%@ Page Title="Tree Measurement Database - Import Trip" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/TripEditor.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Enter general information about your trip.</h2>
<div class="ui-placeholder-import-trip ui-widget-content ui-corner-all">
    <form>
        <div class="ui-form-column">
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Trip.Name) %>
                <%= Html.TextBoxFor(m => m.Trip.Name)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.Name, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.Name, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Trip.Date)%>
                <%= Html.EditorFor(m => m.Trip.Date)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.Date, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.Date, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Trip.Website)%>
                <%= Html.TextBoxFor(m => m.Trip.Website)%>
                <div class="ui-validation-error ">
                    <%= Html.ValidationMessageFor(m => m.Trip.Website, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.Website, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ui-form-column">
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Trip.MeasurerContactInfo)%>
                <%= Html.TextAreaFor(m => m.Trip.MeasurerContactInfo)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.MeasurerContactInfo, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.MeasurerContactInfo, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Trip.PhotosAvailable)%>
                <%= Html.CheckBoxFor(m => m.Trip.PhotosAvailable)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.PhotosAvailable, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.PhotosAvailable, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </form>
    <div class="ui-helper-clearfix"></div>
</div>
</asp:Content>

<asp:Content ContentPlaceHolderID="LeftNavigationContent" runat="server">
<%= Html.ActionLink("Back", "Start", null, new { @class = "ui-direction-import-backward" })%>
</asp:Content>

<asp:Content ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Next", "SiteVisits", null, new { @class = "ui-direction-import-forward" })%>
</asp:Content>
