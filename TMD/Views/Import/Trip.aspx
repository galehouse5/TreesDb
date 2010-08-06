<%@ Page Title="Tree Measurement Database - Import Trip" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/TripEditor.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Enter general information about your trip</h2>
<div class="ImportTrip ui-widget-content ui-corner-all">
    <form>
        <div class="InputColumn">
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Trip.Name) %>
                <%= Html.TextBoxFor(m => m.Trip.Name)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.Name, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.Name, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Trip.Date)%>
                <%= Html.EditorFor(m => m.Trip.Date)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.Date, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.Date, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Trip.Website)%>
                <%= Html.TextBoxFor(m => m.Trip.Website)%>
                <div class="ValidationError ">
                    <%= Html.ValidationMessageFor(m => m.Trip.Website, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.Website, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Trip.PhotosAvailable)%>
                <%= Html.CheckBoxFor(m => m.Trip.PhotosAvailable)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.PhotosAvailable, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.PhotosAvailable, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputColumn">
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Trip.MeasurerContactInfo)%>
                <%= Html.TextAreaFor(m => m.Trip.MeasurerContactInfo)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Trip.MeasurerContactInfo, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Trip.MeasurerContactInfo, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow EnterPublicAccess InputButton">
                <label for="MakeMeasurerContactInfoPublic">Keep private</label>
                <%= Html.RadioButtonFor(m => m.Trip.MakeMeasurerContactInfoPublic, false, new { Id = "MakeMeasurerContactInfoPublic" })%>
                <label for="KeepMeasurerContactInfoPrivate">Make public</label>
                <%= Html.RadioButtonFor(m => m.Trip.MakeMeasurerContactInfoPublic, true, new { Id = "KeepMeasurerContactInfoPrivate" })%>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="treemeasurers">
                <div class="InputRow treemeasurer">
                    <label>*First measuer:</label>
                    <%= Html.TextBoxFor(m => m.Trip.Measurers[0].FirstName, new { Title = "First name", style = "width: 125px;" })%>
                    <%= Html.TextBoxFor(m => m.Trip.Measurers[0].LastName, new { Title = "Last name", style = "width: 125px; margin-left: 4px;" })%>
                    <% if (Html.ValidationMessageFor(m => m.Trip.Measurers[0].FirstName) != null) { %>
                        <div class="ValidationError ui-state-error-text">
                            <%= Html.ValidationMessageFor(m => m.Trip.Measurers[0].FirstName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                            <%= Html.ValidationMessageFor(m => m.Trip.Measurers[0].FirstName, "", new { @class = "ValidationErrorMessage" })%>
                        </div>
                    <% } %>
                    <% if (Html.ValidationMessageFor(m => m.Trip.Measurers[0].LastName) != null) { %>
                        <div class="ValidationError ui-state-error-text">
                            <%= Html.ValidationMessageFor(m => m.Trip.Measurers[0].LastName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                            <%= Html.ValidationMessageFor(m => m.Trip.Measurers[0].LastName, "", new { @class = "ValidationErrorMessage" })%>
                        </div>
                    <% } %>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <% if (Model.Trip.Measurers.Count > 1) { %>
                    <div class="InputRow treemeasurer">
                        <label>*Second measuer:</label>
                        <%= Html.TextBoxFor(m => m.Trip.Measurers[1].FirstName, new { Title = "First name", style = "width: 125px;" })%>
                        <%= Html.TextBoxFor(m => m.Trip.Measurers[1].LastName, new { Title = "Last name", style = "width: 125px; margin-left: 4px;" })%>
                        <% if (Html.ValidationMessageFor(m => m.Trip.Measurers[1].FirstName) != null) { %>
                            <div class="ValidationError ui-state-error-text">
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[1].FirstName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[1].FirstName, "", new { @class = "ValidationErrorMessage" })%>
                            </div>
                        <% } %>
                        <% if (Html.ValidationMessageFor(m => m.Trip.Measurers[1].LastName) != null) { %>
                            <div class="ValidationError ui-state-error-text">
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[1].LastName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[1].LastName, "", new { @class = "ValidationErrorMessage" })%>
                            </div>
                        <% } %>
                        <div class='ui-helper-clearfix'></div>
                    </div>
                <% } %>
                <% if (Model.Trip.Measurers.Count > 2) { %>
                    <div class="InputRow treemeasurer">
                        <label>*Third measuer:</label>
                        <%= Html.TextBoxFor(m => m.Trip.Measurers[2].FirstName, new { Title = "First name", style = "width: 125px;" })%>
                        <%= Html.TextBoxFor(m => m.Trip.Measurers[2].LastName, new { Title = "Last name", style = "width: 125px; margin-left: 4px;" })%>
                        <% if (Html.ValidationMessageFor(m => m.Trip.Measurers[2].FirstName) != null) { %>
                            <div class="ValidationError ui-state-error-text">
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[2].FirstName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[2].FirstName, "", new { @class = "ValidationErrorMessage" })%>
                            </div>
                        <% } %>
                        <% if (Html.ValidationMessageFor(m => m.Trip.Measurers[2].LastName) != null) { %>
                            <div class="ValidationError ui-state-error-text">
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[2].LastName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                                <%= Html.ValidationMessageFor(m => m.Trip.Measurers[2].LastName, "", new { @class = "ValidationErrorMessage" })%>
                            </div>
                        <% } %>
                        <div class='ui-helper-clearfix'></div>
                    </div>
                <% } %>
                <div class="InputRow" style="float: left; margin-left: 100px">
                    <% if (Model.Trip.Measurers.Count > 1) { %>
                        <a href="javascript:TripEditor.RemoveMeasurer()" class="measurer-remove">Remove</a>
                    <% } %>
                    <% if (Model.Trip.Measurers.Count < 3) { %>
                        <a href="javascript:TripEditor.AddMeasurer()" class="measurer-add">Add another measurer</a>
                    <% } %>
                </div>
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
<%= Html.ActionLink("Next", "SiteVisits", null, new { @class = "import-navigation-forward" })%>
</asp:Content>
