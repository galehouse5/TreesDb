<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/CoordinatePicker.js"></script>
<script type="text/javascript" src="/Scripts/Import/SiteVisitsEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/SiteVisitEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/SubsiteVisitEditor.js"></script>
<script type="text/javascript" src="/Scripts/ValueObjectService.js"></script>
<%= Html.LoadGoogleMapsApiV3() %>
<script type="text/javascript" src="/Scripts/GeocoderService.js"></script>
<script type="text/javascript" src="/Scripts/MapMarkerService.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<div class='sitevisits-placeholder'>
    <h3>Add the sites you visited on your trip.</h3>
    <div class='sectionspacer'></div>
    <a class='sitevisit-add' href='javascript:SiteVisitEditor.Add(SiteVisitsEditor.Refresh)'>Add site visit</a><%= Html.ValidationMessage("Trip.SiteVisits")%>
    <ul class='sitevisit-list'>
    <% for (int sv = 0; sv < Model.Trip.SiteVisits.Count; sv++) { %>
        <li class='sitevisit'>
            <span class='icon'></span>
            <div class='column'>
                <span><%= Model.Trip.SiteVisits[sv].Name%></span>
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}]", sv))%>
                <br />
                <a href='javascript:SiteVisitEditor.Edit(<%= sv %>, {onClose: SiteVisitsEditor.Refresh})'>Edit</a>
                <a href='javascript:SiteVisitRemover.Open(<%= sv %>, SiteVisitsEditor.Refresh)'>Remove</a>
            </div>
            <div class='ui-helper-clearfix'></div>
            <ul class='subsitevisit-list'>
            <% for (int ssv = 0; ssv < Model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++) { %>
                <li class='subsitevisit'>
                    <span class='icon'></span>
                    <div class='column'>
                        <span><%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Name%></span>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv))%>
                        <br />
                        <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: SiteVisitsEditor.Refresh})'>Edit</a>
                        <a href='javascript:SubsiteVisitRemover.OpenForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: SiteVisitsEditor.Refresh})'>Remove</a>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </li>
            <% } %>
            </ul>
        </li>
    <% } %>
    </ul>
    <div class='sectionspacer'></div>
</div>
</asp:Content>

<asp:Content ID="Content4" ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "TreeMeasurements", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "Trip", null, new { @class = "retreat" })%>
</asp:Content>
