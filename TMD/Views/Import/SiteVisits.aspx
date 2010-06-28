<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/Common.js"></script>
<script type="text/javascript" src="/Scripts/Import/CoordinatePicker.js"></script>
<script type="text/javascript" src="/Scripts/Import/SiteVisitsEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/SiteVisitEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/SubsiteVisitEditor.js"></script>
<%= Html.LoadGoogleMapsApiV3() %>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<div class="sitevisits-placeholder">
    <h3>List the sites you visited on your trip</h3>
    <div class="sectionspacer"></div>
    <p>
        Click <a class='site-visit' href='javascript:SiteVisitEditor.Add()'>Add site visit</a> to build a list of the sites you visited on your trip.
    </p>
    <%= Html.ValidationMessage("Trip.SiteVisits")%>
    <ul class="site-visit-list">
    <% for (int sv = 0; sv < Model.Trip.SiteVisits.Count; sv++) { %>
        <li class="site-visit">
            <span class="icon"></span>
            <div class="column">
                <span><%= Model.Trip.SiteVisits[sv].Name%></span>
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}]", sv))%>
                <br />
                <a href="javascript:SiteVisitEditor.Edit(<%= sv %>)">Edit</a>
                <a href="javascript:SiteVisitEditor.Remove(<%= sv %>)">Remove</a>
            </div>
            <div class="ui-helper-clearfix"></div>
            <ul class="subsite-visit-list">
            <% for (int ssv = 0; ssv < Model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++) { %>
                <li class="subsite-visit">
                    <span class="icon"></span>
                    <div class="column">
                        <span><%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Name%></span>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv))%>
                        <br />
                        <a href="javascript:SubsiteVisitEditor.EditIndependent(<%= sv %>, <%= ssv %>)">Edit</a>
                        <a href="javascript:SubsiteVisitEditor.RemoveIndependent(<%= sv %>, <%= ssv %>)">Remove</a>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </li>
            <% } %>
            </ul>
        </li>
    <% } %>
    </ul>
    <div class="sectionspacer"></div>
</div>
</asp:Content>

<asp:Content ID="Content4" ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "Measurements", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "Trip", null, new { @class = "retreat" })%>
</asp:Content>
