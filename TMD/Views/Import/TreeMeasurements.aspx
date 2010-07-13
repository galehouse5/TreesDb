<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/TreeMeasurementsEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/TreeMeasurementEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/CoordinatePicker.js"></script>
<script type="text/javascript" src="/Scripts/ValueObjectService.js"></script>
<%= Html.LoadGoogleMapsApiV3() %>
<script type="text/javascript" src="/Scripts/GeocoderService.js"></script>
<script type="text/javascript" src="/Scripts/MapMarkerService.js"></script>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h2>Add the measurements you recorded at your subsite visits.</h2>
<div class="ui-placeholder-import-sitevisits">
    <% for (int sv = Model.Trip.SiteVisits.Count - 1; sv >= 0; sv--) { %>
        <div class="ui-content-import-sitevisit ui-widget ui-widget-content ui-corner-all">
            <div class="ui-content-import-header ui-widget-header ui-corner-all">
                <span class="ui-icon-import-sitevisit"></span>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                Name: <%= Model.Trip.SiteVisits[sv].Name %>
                <br />
                Coordinates: <%= Model.Trip.SiteVisits[sv].Coordinates %>
            </div>
        </div>
        <div class="ui-content-import-subsitevisits">
            <% for (int ssv = Model.Trip.SiteVisits[sv].SubsiteVisits.Count - 1; ssv >= 0; ssv--) { %>
                <div class="ui-content-import-subsitevisit ui-widget ui-widget-content ui-corner-all">
                    <div class="ui-content-import-header ui-widget-header ui-corner-all">
                        <span class="ui-icon-import-subsitevisit"></span>
                        <a href='javascript:TreeMeasurementEditor.Add(<%= sv %>, <%= ssv %>, TreeMeasurementsEditor.Refresh)' class="ui-button-import-add-treemeasurement">Add measurement</a>
                        <div class="ui-helper-clearfix"></div>
                    </div>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements", sv, ssv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements", sv, ssv), "", new { @class = "ui-validation-error-message" })%>
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
                                <a href='javascript:TreeMeasurementEditor.Edit(<%= sv %>, <%= ssv %>, <%= tm %>, TreeMeasurementsEditor.Refresh)' class="ui-button-import-edit">Edit</a>
                                <a href='javascript:TreeMeasurementRemover.Open(<%= sv %>, <%= ssv %>, <%= tm %>, TreeMeasurementsEditor.Refresh)' class="ui-button-import-remove">Remove</a>
                                <div class="ui-helper-clearfix"></div>
                            </div>
                            <div class="ui-validation-error ui-state-error-text">
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", sv, ssv, tm), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                                <%= Html.ValidationMessage(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", sv, ssv, tm), "", new { @class = "ui-validation-error-message" })%>
                            </div>
                            <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                                <% if (Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].TreeNameSpecified) { %>
                                   Name : <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].TreeName %>
                                   <br />
                                <% } %>
                                Common name: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].CommonName %>
                                <br />
                                Scientific name: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].ScientificName %>
                                <br />
                                Coordinates: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].Coordinates%>
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
<%= Html.ActionLink("Back", "SiteVisits", null, new { @class = "ui-direction-import-backward" })%>
</asp:Content>

<asp:Content ID="Content5" ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Next", "Review", null, new { @class = "ui-direction-import-forward" })%>
</asp:Content>

