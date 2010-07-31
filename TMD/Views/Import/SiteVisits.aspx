<%@ Page Title="Tree Measurement Database - Import Sites & Subsites" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/SiteVisitsEditor.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Add the sites and subsites you visited on your trip</h2>
<div class="import-sitevisits">
    <a class="import-button-add-sitevisit" href='javascript:SiteVisitEditor.Add(SiteVisitsEditor.Refresh)'>Add site visit</a>
    <div class="ui-validation-error ui-state-error-text">
        <%= Html.ValidationMessage("Trip.SiteVisits", " ", new { @class = "ui-icon ui-icon-circle-close" })%>
        <%= Html.ValidationMessage("Trip.SiteVisits", "", new { @class = "ui-validation-error-message" })%>
    </div>
    <div class="ui-helper-clearfix"></div>
    <% if (Model.Trip.SiteVisits.Count == 0) { %>
        <p>Click the button above to add a site visit.</p>    
    <% } %>
    <div class="ui-helper-clearfix"></div>
    <% for (int sv = Model.Trip.SiteVisits.Count - 1; sv >= 0; sv--) { %>
        <div class="ui-content-import-sitevisit ui-widget ui-widget-content ui-corner-all">
            <div class="ui-content-import-header ui-widget-header ui-corner-all">
                <span class="ui-icon-import-sitevisit"></span>
                <a href='javascript:SiteVisitEditor.Edit(<%= sv %>, {onClose: SiteVisitsEditor.Refresh})' class="import-button-edit">Edit</a>
                <a href='javascript:SiteVisitRemover.Open(<%= sv %>, SiteVisitsEditor.Refresh)' class="import-button-remove">Remove</a>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-validation-error ui-state-error-text">
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}]", sv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}]", sv), "", new { @class = "ui-validation-error-message" })%>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                Name: <%= Model.Trip.SiteVisits[sv].Name %>
                <br />
                Coordinates: <%= Model.Trip.SiteVisits[sv].Coordinates %>
            </div>
        </div>
        <div class="import-subsitevisits">
            <% for (int ssv = Model.Trip.SiteVisits[sv].SubsiteVisits.Count - 1; ssv >= 0; ssv--) { %>
                <div class="ui-content-import-subsitevisit ui-widget ui-widget-content ui-corner-all">
                    <div class="ui-content-import-header ui-widget-header ui-corner-all">
                        <span class="ui-icon-import-subsitevisit"></span>
                        <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: SiteVisitsEditor.Refresh})' class="import-button-edit">Edit</a>
                        <a href='javascript:SubsiteVisitRemover.OpenForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: SiteVisitsEditor.Refresh})' class="import-button-remove">Remove</a>
                        <div class="ui-helper-clearfix"></div>
                    </div>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv), "", new { @class = "ui-validation-error-message" })%>
                        <div class="ui-helper-clearfix"></div>
                    </div>
                    <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                        Name: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Name %>
                        <br />
                        Location: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].County %>, <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].State %>
                        <br />
                        Coordinates: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Coordinates%>
                    </div>
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
<%= Html.ActionLink("Next", "TreeMeasurements", null, new { @class = "import-navigation-forward" })%>
</asp:Content>
