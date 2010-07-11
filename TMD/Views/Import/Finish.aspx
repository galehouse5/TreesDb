<%@ Page Title="Tree Measurement Database - Import Start" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Your trip has been saved.  You should note the assigned tree numbers for later reference.</h2>
<div class="ui-placeholder-import-sitevisits">
    <% for (int sv = 0; sv < Model.Trip.SiteVisits.Count; sv++) { %>
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
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="ui-content-import-subsitevisits">
            <% for (int ssv = 0; ssv < Model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++) { %>
                <div class="ui-content-import-subsitevisit ui-widget ui-widget-content ui-corner-all">
                    <div class="ui-content-import-header ui-widget-header ui-corner-all">
                        <span class="ui-icon-import-subsitevisit"></span>
                        <div class="ui-helper-clearfix"></div>
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
                <div class="ui-content-import-treemeasurements">
                    <% for (int tm = 0; tm < Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count; tm++) { %>
                        <div class="ui-content-import-treemeasurement ui-widget ui-widget-content ui-corner-all">
                            <div class="ui-content-import-header ui-widget-header ui-corner-all">
                                <span class="ui-icon-import-treemeasurement"></span>
                                <div class="ui-helper-clearfix"></div>
                            </div>
                            <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                                Tree number: <%= Model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm].TreeNumber %>
                                <br />
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
                            <div class="ui-helper-clearfix"></div>
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

<asp:Content ContentPlaceHolderID="LeftNavigationContent" runat="server">
&nbsp;
</asp:Content>

<asp:Content ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("New import", "Start", null, new { @class = "ui-direction-import-forward" })%>
</asp:Content>