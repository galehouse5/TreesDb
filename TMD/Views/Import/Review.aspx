<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/ReviewEditor.js"></script>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h2>Review your trip for errors before finishing.</h2>
<div class="import-sitevisits">
    <% for (int sv = Model.Trip.SiteVisits.Count - 1; sv >= 0; sv--) { %>
        <div class="ui-content-import-sitevisit ui-widget ui-widget-content ui-corner-all">
            <div class="ui-content-import-header ui-widget-header ui-corner-all">
                <span class="ui-icon-import-sitevisit"></span>
                <a href='javascript:SiteVisitEditor.Edit(<%= sv %>, {onClose: ReviewEditor.Refresh, disableSubsiteVisitAdding: true})' class="import-button-edit">Edit</a>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-validation-error ui-state-error-text">
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].Coordinates", sv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].Coordinates", sv), "", new { @class = "ui-validation-error-message" })%>
                <%= Html.ValidationMessage("Trip.SiteVisits", " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessage("Trip.SiteVisits", "", new { @class = "ui-validation-error-message" })%>
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
                        <a href='javascript:SubsiteVisitEditor.EditForSiteVisit(<%= sv %>, <%= ssv %>, {onClose: ReviewEditor.Refresh})' class="import-button-edit">Edit</a>
                        <div class="ui-helper-clearfix"></div>
                    </div>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].Coordinates", sv, ssv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].Coordinates", sv, ssv), "", new { @class = "ui-validation-error-message" })%>
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
                <div class="ui-content-import-treemeasurements">
                    <% for (int tm = Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count - 1; tm >= 0; tm--) { %>
                        <div class="ui-content-import-treemeasurement ui-widget ui-widget-content ui-corner-all">
                            <div class="ui-content-import-header ui-widget-header ui-corner-all">
                                <span class="ui-icon-import-treemeasurement"></span>
                                <a href='javascript:TreeMeasurementEditor.Edit(<%= sv %>, <%= ssv %>, <%= tm %>, ReviewEditor.Refresh)' class="import-button-edit">Edit</a>
                                <div class="ui-helper-clearfix"></div>
                            </div>
                            <div class="ui-validation-error ui-state-error-text">
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates", sv, ssv, tm), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates", sv, ssv, tm), "", new { @class = "ui-validation-error-message" })%>
                                <div class="ui-helper-clearfix"></div>
                            </div>
                            <div class="ui-validation-warning ui-state-active">
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates.Warning", sv, ssv, tm), " ", new { @class = "ui-icon ui-icon-alert" })%>
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}].Coordinates.Warning", sv, ssv, tm), "", new { @class = "ui-validation-warning-message" })%>
                                <div class="ui-helper-clearfix"></div>
                            </div>
                            <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                                <% if (Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].TreeNameOrNumberSpecified) { %>
                                   Name : <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].TreeNameOrNumber %>
                                   <br />
                                <% } %>
                                Common name: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].CommonName %>
                                <br />
                                Scientific name: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].ScientificName %>
                                <br />
                                Coordinates: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].Coordinates %>
                            </div>
                        </div>
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
