<%@ Page Title="Tree Measurement Database - Import Sites & Subsites" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/SiteVisitsEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/SiteVisitEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/SubsiteVisitEditor.js"></script>
<script type="text/javascript" src="/Scripts/ValueObjectService.js"></script>
<script type="text/javascript" src="/Scripts/Import/CoordinatePicker.js"></script>
<%= Html.LoadGoogleMapsApiV3() %>
<script type="text/javascript" src="/Scripts/GeocoderService.js"></script>
<script type="text/javascript" src="/Scripts/MapMarkerService.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Add the sites and subsites you visited on your trip.</h2>
<div class="ui-placeholder-import-sitevisits">
    <a class="ui-button-import-add-sitevisit" href='javascript:SiteVisitEditor.Add(SiteVisitsEditor.Refresh)'>Add site visit</a>
    <div class="ui-validation-error ui-state-error-text">
        <%= Html.ValidationMessage("Trip.SiteVisits", " ", new { @class = "ui-icon ui-icon-circle-close" })%>
        <%= Html.ValidationMessage("Trip.SiteVisits", "", new { @class = "ui-validation-error-message" })%>
    </div>    
    <% for (int sv = 0; sv < Model.Trip.SiteVisits.Count; sv++) { %>
        <div class="ui-content-import-sitevisit ui-widget ui-widget-content ui-corner-all">
            <div class="ui-content-import-header ui-widget-header ui-corner-all">
                <span class="ui-icon-import-sitevisit"></span>
                <a href='javascript:SiteVisitEditor.Edit(<%= sv %>, {onClose: SiteVisitsEditor.Refresh})' class="ui-button-import-edit">Edit</a>
                <a href='javascript:SiteVisitRemover.Open(<%= sv %>, SiteVisitsEditor.Refresh)' class="ui-button-import-remove">Remove</a>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-validation-error ui-state-error-text">
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}]", sv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}]", sv), "", new { @class = "ui-validation-error-message" })%>
            </div>
            <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                Name: <%= Model.Trip.SiteVisits[sv].Name %>
                <br />
                Coordinates: <%= Model.Trip.SiteVisits[sv].Coordinates %>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ui-content-import-subsitevisits">
            <% for (int ssv = 0; ssv < Model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++) { %>
                <div class="ui-content-import-subsitevisit ui-widget ui-widget-content ui-corner-all">
                    <div class="ui-content-import-header ui-widget-header ui-corner-all">
                        <span class="ui-icon-import-subsitevisit"></span>
                        <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: SiteVisitsEditor.Refresh})' class="ui-button-import-edit">Edit</a>
                        <a href='javascript:SubsiteVisitRemover.OpenForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: SiteVisitsEditor.Refresh})' class="ui-button-import-remove">Remove</a>
                        <div class="ui-helper-clearfix"></div>
                    </div>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv), "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                        Name: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Name %>
                        <br />
                        Location: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].County %>, <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].State %>
                        <br />
                        Coordinates: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Coordinates%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-helper-clearfix"></div>
            <% } %>
        </div>
        <div class="ui-helper-clearfix"></div>
    <% } %>
</div>
</asp:Content>


<asp:Content ID="Content1" ContentPlaceHolderID="LeftNavigationContent" runat="server">
<%= Html.ActionLink("Back", "Trip", null, new { @class = "ui-direction-import-backward" })%>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Next", "TreeMeasurements", null, new { @class = "ui-direction-import-forward" })%>
</asp:Content>
