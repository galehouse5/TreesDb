<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/Measurements.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h3>Enter measurements</h3>
<div class="sectionspacer">&nbsp;</div>
<p>
    Click Add measurement below each site to build a list of the measurements you recorded on your visit.
    When finished, advance to the final step to review your data and check for errors.
</p>
<form id="measurementsForm" action="">
<ul id="SiteList">
<% for (int s = 0; s < Model.Sites.Count; s++) { %>
    <li id="<%= Model.Sites[s].Id %>" class="Site">
        <span class="Icon"></span>
        <div class="Column">
            <span class="Name"><%= Model.Sites[s].Name %></span>
            <br />
            <a href="javascript:AddSiteMeasurement('<%= Model.Sites[s].Id %>')">Add measurement</a>
        </div>
        <div class="Column">
            <%= Html.Hidden(string.Format("Site{0}NumberOfMeasurements", s), 
                        Model.Sites[s].MeasurementCount, 
                        new { @class = "NumberOfMeasurements" }) %>
        </div>
        <div class="ui-helper-clearfix"></div>
        <ul class="MeasurementList">
        <% for (int m = 0; m < Model.Sites[s].Measurements.Count; m++) { %>
            <li id="<%= Model.Sites[s].Measurements[m].Id %>" class="Measurement">
                <span class="Icon"></span>
                <div class="Column">
                    <span class="ScientificName"><%= Model.Sites[s].Measurements[m].ScientificName %></span>
                    <br />
                    <span class="CommonName"><%= Model.Sites[s].Measurements[m].CommonName %></span>
                </div>
                <div class="Column">
                    <a href="javascript:EditSiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Measurements[m].Id %>')">Edit</a>
                    <br />
                    <a href="javascript:DeleteSiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Measurements[m].Id %>')">Delete</a>
                </div>
                <div class="ui-helper-clearfix"></div>
            </li>
        <% } %>
        </ul>
        <ul class="SubsiteList">
        <% for (int ss = 0; ss < Model.Sites[s].Subsites.Count; ss++) { %>
            <li id="<%= Model.Sites[s].Subsites[ss].Id %>" class="Subsite">
                <span class="Icon"></span>
                <div class="Column">
                    <span class="Name"><%= Model.Sites[s].Subsites[ss].Name %></span>
                    <br />
                    <a href="javascript:AddSubsiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>')">Add measurement</a>
                </div>
                <div class="Column">
                    <%= Html.Hidden(string.Format("Site{0}Subsite{1}NumberOfMeasurements", s, ss), 
                        Model.Sites[s].Subsites[ss].Measurements.Count, 
                        new { @class = "NumberOfMeasurements" }) %>
                </div>
                <div class="ui-helper-clearfix"></div>
                <ul class="MeasurementList">
                    <% for (int m = 0; m < Model.Sites[s].Subsites[ss].Measurements.Count; m++) { %>
                    <li id="<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>" class="Measurement">
                        <span class="Icon"></span>
                        <div class="Column">
                            <span class="ScientificName"><%= Model.Sites[s].Subsites[ss].Measurements[m].ScientificName %></span>
                            <br />
                            <span class="CommonName"><%= Model.Sites[s].Subsites[ss].Measurements[m].CommonName %></span>
                        </div>
                        <div class="Column">
                            <a href="javascript:EditSubsiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>', '<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>')">Edit</a>
                            <br />
                            <a href="javascript:DeleteSubsiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>', '<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>')">Delete</a>
                        </div>
                        <div class="ui-helper-clearfix"></div>
                    </li>
                    <% } %>
                </ul>
            </li>
        <% } %>
        </ul>
    </li>
<% } %>
</ul>
</form>
<div class="sectionspacer">&nbsp;</div>
</asp:Content>

<asp:Content ID="Content4" ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "Review", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "SiteVisits", null, new { @class = "retreat" })%>
</asp:Content>
