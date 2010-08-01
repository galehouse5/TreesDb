<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/ReviewEditor.js"></script>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h2>Review your trip for errors before finishing.</h2>
<div class="import-sitevisits">
    <% for (int sv = Model.Trip.SiteVisits.Count - 1; sv >= 0; sv--) { %>
        <% Html.RenderPartial("SiteVisitSummary",
               Model.Trip.SiteVisits[sv],
               new ViewDataDictionary(ViewData) { { "Review", true }, { "SiteVisitIndex", sv } }); %>
        <div class="import-subsitevisits">
            <% for (int ssv = Model.Trip.SiteVisits[sv].SubsiteVisits.Count - 1; ssv >= 0; ssv--) { %>
                <% Html.RenderPartial("SubsiteVisitSummary",
                       Model.Trip.SiteVisits[sv].SubsiteVisits[ssv],
                       new ViewDataDictionary(ViewData) { { "Review", true }, { "SiteVisitIndex", sv }, { "SubsiteVisitIndex", ssv } }); %>
                <div class="ui-content-import-treemeasurements">
                    <% for (int tm = Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count - 1; tm >= 0; tm--) { %>
                        <% Html.RenderPartial("TreeMeasurementSummary", 
                               Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm],
                               new ViewDataDictionary(ViewData) { { "Review", true }, { "SiteVisitIndex", sv }, { "SubsiteVisitIndex", ssv }, { "TreeMeasurementIndex", tm } }); %>
                    <% } %>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-helper-clearfix"></div>
            <% } %>
        </div>
        <div class="ui-helper-clearfix"></div>
    <% } %>
</div>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="LeftNavigationContent" runat="server">
<%= Html.ActionLink("Back", "TreeMeasurements", null, new { @class = "ui-direction-import-backward" })%>
</asp:Content>

<asp:Content ID="Content5" ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Finish", "Finish", null, new { @class = "import-navigation-forward" })%>
</asp:Content>
