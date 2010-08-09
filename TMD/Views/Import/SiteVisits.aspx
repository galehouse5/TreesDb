<%@ Page Title="Tree Measurement Database - Import Sites & Subsites" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/SiteVisitsEditor.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Add the sites and subsites you visited on your trip</h2>
<div class="import-sitevisits">
    <a class="ImportAddSiteVisitButton" href='javascript:SiteVisitEditor.Add(SiteVisitsEditor.Refresh)'>Add site visit</a>
    <div class="ValidationError ui-state-error-text">
        <%= Html.ValidationMessage("Trip.SiteVisits", " ", new { @class = "ui-icon ui-icon-circle-close" })%>
        <%= Html.ValidationMessage("Trip.SiteVisits", "", new { @class = "ValidationErrorMessage" })%>
    </div>
    <div class="ui-helper-clearfix"></div>
    <% if (Model.Trip.SiteVisits.Count == 0) { %>
        <p>Click the button above to add a site visit.</p>    
    <% } %>
    <div class="ui-helper-clearfix"></div>
    <% for (int sv = Model.Trip.SiteVisits.Count - 1; sv >= 0; sv--) { %>
        <% Html.RenderPartial("SiteVisitSummary",
               Model.Trip.SiteVisits[sv],
               new ViewDataDictionary(ViewData) { { "Edit", true }, { "SiteVisitIndex", sv } }); %>
        <div class="ImportSubsiteVisitSummaries">
            <% for (int ssv = Model.Trip.SiteVisits[sv].SubsiteVisits.Count - 1; ssv >= 0; ssv--) { %>
                <% Html.RenderPartial("SubsiteVisitSummary",
                       Model.Trip.SiteVisits[sv].SubsiteVisits[ssv],
                       new ViewDataDictionary(ViewData) { { "Edit", true }, { "SiteVisitIndex", sv }, { "SubsiteVisitIndex", ssv } }); %>
                <div class="ui-helper-clearfix"></div>
            <% } %>
        </div>
        <div class="ui-helper-clearfix"></div>
    <% } %>
</div>
</asp:Content>


<asp:Content ID="Content1" ContentPlaceHolderID="LeftNavigationContent" runat="server">
<%= Html.ActionLink("Back", "Trip", null, new { @class = "ImportNavigateBackwards" })%>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Next", "TreeMeasurements", null, new { @class = "ImportNavigateForwards" })%>
</asp:Content>
