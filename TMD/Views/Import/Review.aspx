<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/Review.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h3>Review</h3>
<div class="sectionspacer"></div>
<p>
    Review the list of sites and measurements you have constructed to correct any indicated errors.
    When finished, move to the final step to save your data to the database.
</p>
<ul id="SiteList">
<% for (int s = 0; s < Model.Sites.Count; s++) { %>
    <li id="<%= Model.Sites[s].Id %>" class="Site">
        <span class="Icon"></span>
        <div class="Column">
            <span class="Name"><%= Model.Sites[s].Name %></span>
            <br />
            <a href="javascript:EditSite('<%= Model.Sites[s].Id %>')">Edit</a>
        </div>
        <div class="ui-helper-clearfix"></div>
        <ul class="MeasurementList">
        <% for (int m = 0; m < Model.Sites[s].Measurements.Count; m++) { %>
            <li id="<%= Model.Sites[s].Measurements[m].Id %>" class="Measurement">
                <span class="Icon"></span>
                <div class="Column">
                    <span class="Genus"><%= Model.Sites[s].Measurements[m].Genus %></span>
                    <span class="Species"><%= Model.Sites[s].Measurements[m].Species %></span>
                    <br />
                    <span class="CommonName"><%= Model.Sites[s].Measurements[m].CommonName %></span>
                </div>
                <div class="Column">
                    <a href="javascript:EditSiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Measurements[m].Id %>')">Edit</a>
                </div>
                <div class="ui-helper-clearfix"></div>
            </li>
        <% } %>
        </ul>
        <ul class="SubsiteList">
        <% for (int ss = 0; ss < Model.Sites[s].Subsites.Count; ss++) { %>
            <li id="<%= Model.Sites[s].Subsites[ss].Id %>" class="Subsite">
                <span class="Icon"></span>
                <div class="Column">
                    <span class="Name"><%= Model.Sites[s].Subsites[ss].Name %></span>
                    <br />
                    <a href="javascript:EditSubsite('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>')">Edit</a>
                </div>
                <div class="ui-helper-clearfix"></div>
                <ul class="MeasurementList">
                    <% for (int m = 0; m < Model.Sites[s].Subsites[ss].Measurements.Count; m++) { %>
                    <li id="<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>" class="Measurement">
                        <span class="Icon"></span>
                        <div class="Column">
                            <span class="Genus"><%= Model.Sites[s].Subsites[ss].Measurements[m].Genus %></span>
                            <span class="Species"><%= Model.Sites[s].Subsites[ss].Measurements[m].Species %></span>
                            <br />
                            <span class="CommonName"><%= Model.Sites[s].Subsites[ss].Measurements[m].CommonName %></span>
                        </div>
                        <div class="Column">
                            <a href="javascript:EditSubsiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>', '<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>')">Edit</a>                            
                        </div>
                        <div class="ui-helper-clearfix"></div>
                    </li>
                    <% } %>
                </ul>
            </li>
        <% } %>
        </ul>
    </li>
<% } %>
</ul>
<div class="sectionspacer"></div>
</asp:Content>

<asp:Content ID="Content4" ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Finish >", "Finish", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "Measurements", null, new { @class = "retreat" })%>
</asp:Content>
