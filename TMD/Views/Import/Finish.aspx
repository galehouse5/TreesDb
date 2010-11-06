<%@ Page Title="Import Finish" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Your data has been premanently saved to the tree measurement database!</h2>
<div class="import-sitevisits">
    <% for (int sv = Model.Trip.SiteVisits.Count - 1; sv >= 0; sv--) { %>
        <% Html.RenderPartial("SiteVisitSummary", Model.Trip.SiteVisits[sv]); %>
        <div class="ImportSubsiteVisitSummaries">
            <% for (int ssv = Model.Trip.SiteVisits[sv].SubsiteVisits.Count - 1; ssv >= 0; ssv--) { %>
                <% Html.RenderPartial("SubsiteVisitSummary", Model.Trip.SiteVisits[sv].SubsiteVisits[ssv]); %>
                <div class="ImportTreeMeasurementSummaries">
                    <% for (int tm = Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count - 1; tm >= 0; tm--) { %>
                        <% Html.RenderPartial("TreeMeasurementSummary",
                               Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm],
                               new ViewDataDictionary() { { "IncludeTreeNumber", true } }); %>
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

<asp:Content ContentPlaceHolderID="LeftNavigationContent" runat="server">
&nbsp;
</asp:Content>

<asp:Content ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Done", "Index", null, new { @class = "ImportAdvance" })%>
</asp:Content>