<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/ThirdParty/jquery.inputHintOverlay.js"></script>
<script type="text/javascript" src="/Scripts/Import/ReviewEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/TreeMeasurementEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/CoordinatePicker.js"></script>
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
    <h3>Review your sites, subsites, and measurements before finishing.</h3>
    <div class='sectionspacer'></div>
    <ul class='sitevisit-list'>
    <% for (int sv = 0; sv < Model.Trip.SiteVisits.Count; sv++) { %>
        <li class='sitevisit'>
            <span class='icon'></span>
            <div class='column'>
                <span><%= Model.Trip.SiteVisits[sv].Name%></span>
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].Coordinates", sv))%>
                <br />
                <a href='javascript:SiteVisitEditor.Edit(<%= sv %>, {onClose: ReviewEditor.Refresh, disableSubsiteVisitAdding: true})'>Edit</a>
            </div>
            <div class='ui-helper-clearfix'></div>
            <ul class='subsitevisit-list'>
            <% for (int ssv = 0; ssv < Model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++) { %>
                <li class='subsitevisit'>
                    <span class='icon'></span>
                    <div class='column'>
                        <span><%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Name%></span>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].Coordinates", sv, ssv))%>
                        <br />
                        <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: ReviewEditor.Refresh})'>Edit</a>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                    <ul class='treemeasurement-list'>
                    <% for (int tm = 0; tm < Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count; tm++) { %>
                        <li class='treemeasurement'>
                            <span class='icon'></span>
                            <div class='column'>
                                <span>
                                    <% if (Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].TreeNameSpecified) { %>
                                       <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].TreeName %>
                                    <% } else { %>
                                        <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].ScientificName %> 
                                        <% if (!string.IsNullOrWhiteSpace(Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].CommonName)) { %>
                                            <%= string.Format("({0})", Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].CommonName)%>
                                        <% } %>
                                    <% } %>
                                </span>
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates", sv, ssv, tm))%>
                                <br />
                                <a href='javascript:TreeMeasurementEditor.Edit(<%= sv %>, <%= ssv %>, <%= tm %>, ReviewEditor.Refresh)'>Edit</a>
                            </div>
                            <div class='ui-helper-clearfix'></div>
                        </li>
                    <% } %>
                    </ul>
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
<%= Html.ActionLink("Finish >", "Finish", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "TreeMeasurements", null, new { @class = "retreat" })%>
</asp:Content>
