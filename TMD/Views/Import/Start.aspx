<%@ Page Title="Tree Measurement Database - Import Start" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
</asp:Content>

<asp:Content ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h3>Before you start, please ready the listed information.</h3>
<div class="sectionspacer"></div>
<ul>
    <li>Contact info for the primary measurer on your trip</li>
    <li>Names, counties, states, and ownership info for all visited sites</li>
    <li>Common name, genus, species, and tree form type and number of trunks for all measured trees</li>
    <li>Date of each recorded measurement</li>
    <li>First and last name of all participating measurers</li>
    <li>GPS coordinates either on a site or subsite level or for individual trees</li>
</ul>
<div class="sectionspacer"></div>
</asp:Content>

<asp:Content ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Start >", "Trip", null, new { @class = "advance" })%>
</asp:Content>

