<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/ThirdParty/jquery.inputHintOverlay.js"></script>
<script type="text/javascript" src="/Scripts/Import/TreeMeasurementsEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/TreeMeasurementEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/CoordinatePicker.js"></script>
<script type="text/javascript" src="/Scripts/ValueObjectService.js"></script>
<%= Html.LoadGoogleMapsApiV3() %>
<script type="text/javascript" src="/Scripts/GeocoderService.js"></script>
<script type="text/javascript" src="/Scripts/MapMarkerService.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<div class='treemeasurements-placeholder'>
    <h3>Add the measurements you recorded at your subsites .</h3>
    <div class='sectionspacer'></div>
    <ul class='sitevisit-list'>
    <% for (int sv = 0; sv < Model.Trip.SiteVisits.Count; sv++) { %>
        <li class='sitevisit'>
            <span class='icon'></span>
            <div class='column'>
                <span><%= Model.Trip.SiteVisits[sv].Name%></span>
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}]", sv))%>
                <br />
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
                        <a href='javascript:TreeMeasurementEditor.Add(<%= sv %>, <%= ssv %>, TreeMeasurementsEditor.Refresh)'>Add measurement</a>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements", sv, ssv))%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                    <ul class='treemeasurement-list'>
                    <% for (int tm = 0; tm < Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count; tm++) { %>
                        <li class='treemeasurement'>
                            <span class='icon'></span>
                            <div class='column'>
                                <span><%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].ScientificName %> <%= string.Format("({0})", Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].CommonName)%></span>
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", sv, ssv, tm))%>
                                <br />
                                <a href='javascript:TreeMeasurementEditor.Edit(<%= sv %>, <%= ssv %>, <%= tm %>, TreeMeasurementsEditor.Refresh)'>Edit</a>
                                <a href='javascript:TreeMeasurementRemover.Open(<%= sv %>, <%= ssv %>, <%= tm %>, TreeMeasurementsEditor.Refresh)'>Remove</a>
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
<%= Html.ActionLink("Next >", "Review", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "SiteVisits", null, new { @class = "retreat" })%>
</asp:Content>
