<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import.js"></script>
<script type="text/javascript">
    $(document).ready(function () {
        InitializeSitesFormValidation();
        $('.wizard a').click(function () {
            if (!$(this).hasClass('advance') || $('#sitesForm').valid()) {
                return true;
            } else {
                return false;
            }
        });
    });
</script>
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
<ul class="sites">
<% for (int i = 0; i < Model.Sites.Count; i++) { %>
    <li id="<%= Model.Sites[i].Id %>" class="site">
        <span class="icon"></span>
        <div>
            <span class="name"><%= Model.Sites[i].Name %></span>
            <br />
            <a href="javascript:AddSubsite('<%= Model.Sites[i].Id %>')">Add subsite</a>
            <a href="javascript:EditSite('<%= Model.Sites[i].Id %>')">Edit</a>
            <a href="javascript:DeleteSite('<%= Model.Sites[i].Id %>')">Delete</a>
        </div>
        <ul class="subsites">
        <% for (int j = 0; j < Model.Sites[i].Subsites.Count; j++) { %>
            <li id="<%= Model.Sites[i].Subsites[j].Id %>" class="subsite">
                <span class="icon"></span>
                <div>
                    <span class="name"><%= Model.Sites[i].Subsites[j].Name %></span>
                    <br />
                    <a href="javascript:EditSubsite('<%= Model.Sites[i].Id %>', '<%= Model.Sites[i].Subsites[j].Id %>')">Edit</a>
                    <a href="javascript:DeleteSubsite('<%= Model.Sites[i].Id %>', '<%= Model.Sites[i].Subsites[j].Id %>')">Delete</a>
                </div>
            </li>
        <% } %>
        </ul>
    </li>
<% } %>
</ul>
<form id="sitesForm" method="post" action="">
    <%= Html.Hidden("NumberOfSites", Model.Sites.Count) %>
    <div class="ui-helper-clearfix"></div>
</form>
<div class="sectionspacer"></div>
</asp:Content>

<asp:Content ID="Content4" ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "Measurements", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "TripInfo", null, new { @class = "retreat" })%>
</asp:Content>
