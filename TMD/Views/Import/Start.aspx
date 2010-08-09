<%@ Page Title="Tree Measurement Database - Import Start" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Ready the listed information before you start</h2>
<ul>
    <li>Contact info for the primary measurer on your trip</li>
    <li>Names, counties, states, and ownership info for all visited sites</li>
    <li>Common name, genus, species, and tree form type and number of trunks for all measured trees</li>
    <li>Date of each recorded measurement</li>
    <li>First and last name of all participating measurers</li>
    <li>GPS coordinates either on a site or subsite level or for individual trees</li>
</ul>
</asp:Content>

<asp:Content ContentPlaceHolderID="LeftNavigationContent" runat="server">
<%= Html.ActionLink("Back", "Index", null, new { @class = "ImportNavigateBackwards" })%>
</asp:Content>

<asp:Content ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Start", "Trip", null, new { @class = "ImportNavigateForwards" })%>
</asp:Content>

