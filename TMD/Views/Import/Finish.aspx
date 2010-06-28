<%@ Page Title="Tree Measurement Database - Import Start" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/Start.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h3>Finish</h3>
<div class="sectionspacer">&nbsp;</div>
<p>Your data has been imported successfully! (not really)</p>
<div class="sectionspacer">&nbsp;</div>
<p>Keep your import code <strong>xxxx</strong> for later reference.</p>
<div class="sectionspacer">&nbsp;</div>
</asp:Content>

<asp:Content ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("New Import >", "Start", null, new { @class = "advance" })%>
</asp:Content>

