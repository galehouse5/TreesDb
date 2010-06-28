<%@ Page Title="Tree Measurement Database - Import Start" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/Start.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h3>Before you start</h3>
<div class="sectionspacer"></div>
<p>Please review the list of required information for importing your trip into the database.</p>
<ul>
    <li>Contact info for the primary measurer on your trip</li>
    <li>Names, counties, states, and ownership info for all visited sites</li>
    <li>Common name, genus, species, and tree form type and number of trunks for all measured trees</li>
    <li>Date of each recorded measurement</li>
    <li>First and last name of all participating measurers</li>
    <li>GPS coordinates either on a site or subsite level or for individual trees</li>
</ul>
<p>Use the navigation buttons in the lower right to advance through the import process.</p>
<div class="sectionspacer"></div>
</asp:Content>

<asp:Content ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Start >", "Trip", null, new { @class = "advance" })%>
</asp:Content>

