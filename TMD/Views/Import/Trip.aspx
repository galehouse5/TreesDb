<%@ Page Title="Import Trip" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportStepModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/Trip.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Enter general information about your trip</h2>
<% Html.RenderAction("Edit", "Trip");  %>
</asp:Content>

<asp:Content ContentPlaceHolderID="LeftNavigationContent" runat="server">
<%= Html.ActionLink("Back", "Start", null, new { @class = "ImportRetreat" })%>
</asp:Content>

<asp:Content ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Next", "SiteVisits", null, new { @class = "ImportAdvance" })%>
</asp:Content>
