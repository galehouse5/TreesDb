<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/SiteInfo.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h3>Enter site information</h3>
<div class="sectionspacer"></div>
<p>
    Click <a href="javascript:AddSite()">Add site</a> to build a list of the sites you visited on your trip.
    When finished, move to the next step to list the measurements you recorded at each site.
</p>
<ul id="SiteList">
<% for (int s = 0; s < Model.Sites.Count; s++) { %>
    <li id="<%= Model.Sites[s].Id %>" class="Site">
        <span class="Icon"></span>
        <div class="Column">
            <span class="Name"><%= Model.Sites[s].Name %></span>
            <br />
            <a href="javascript:AddSubsite('<%= Model.Sites[s].Id %>')">Add subsite</a>
            <a href="javascript:EditSite('<%= Model.Sites[s].Id %>')">Edit</a>
            <a href="javascript:DeleteSite('<%= Model.Sites[s].Id %>')">Delete</a>
        </div>
        <div class="ui-helper-clearfix"></div>
        <ul class="SubsiteList">
        <% for (int ss = 0; ss < Model.Sites[s].Subsites.Count; ss++) { %>
            <li id="<%= Model.Sites[s].Subsites[ss].Id %>" class="Subsite">
                <span class="Icon"></span>
                <div class="Column">
                    <span class="Name"><%= Model.Sites[s].Subsites[ss].Name %></span>
                    <br />
                    <a href="javascript:EditSubsite('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>')">Edit</a>
                    <a href="javascript:DeleteSubsite('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>')">Delete</a>
                </div>
                <div class="ui-helper-clearfix"></div>
            </li>
        <% } %>
        </ul>
    </li>
<% } %>
</ul>
<form id="sitesForm" action="">
    <%= Html.Hidden("NumberOfSites", Model.Sites.Count) %>
    <div class="ui-helper-clearfix"></div>
</form>
<div class="sectionspacer"></div>
</asp:Content>

<asp:Content ID="Content4" ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "Measurements", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "TripInfo", null, new { @class = "retreat" })%>
</asp:Content>
