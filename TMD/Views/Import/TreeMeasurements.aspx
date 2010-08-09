﻿<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/TreeMeasurementsEditor.js"></script>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h2>Add the trees you measured on your trip</h2>
<div class="import-sitevisits">
    <% for (int sv = Model.Trip.SiteVisits.Count - 1; sv >= 0; sv--) { %>
        <% Html.RenderPartial("SiteVisitSummary", Model.Trip.SiteVisits[sv]); %>
        <div class="ImportSubsiteVisitSummaries">
            <% for (int ssv = Model.Trip.SiteVisits[sv].SubsiteVisits.Count - 1; ssv >= 0; ssv--) { %>
                <% Html.RenderPartial("SubsiteVisitSummary",
                       Model.Trip.SiteVisits[sv].SubsiteVisits[ssv],
                       new ViewDataDictionary(ViewData) { { "AddTreeMeasurements", true }, { "SiteVisitIndex", sv }, { "SubsiteVisitIndex", ssv } }); %>
                <div class="ImportTreeMeasurementSummaries">
                    <% for (int tm = Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count - 1; tm >= 0; tm--) { %>
                        <% Html.RenderPartial("TreeMeasurementSummary",
                               Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm],
                               new ViewDataDictionary(ViewData) { { "Edit", true }, { "SiteVisitIndex", sv }, { "SubsiteVisitIndex", ssv }, { "TreeMeasurementIndex", tm } });%>
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
<%= Html.ActionLink("Back", "SiteVisits", null, new { @class = "ImportNavigateBackwards" })%>
</asp:Content>

<asp:Content ID="Content5" ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Next", "Review", null, new { @class = "ImportNavigateForwards" })%>
</asp:Content>

