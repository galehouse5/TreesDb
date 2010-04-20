<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/Common.js"></script>
<script type="text/javascript" src="/Scripts/Import/SitesTreeView.js"></script>
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
<% Html.RenderPartial("SitesTreeView"); %>
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
