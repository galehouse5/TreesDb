<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportsModel>" MasterPageFile="~/Views/Shared/Site.Master" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/TripsEditor.js"></script>
<script type="text/javascript" src="/Scripts/Import/TripEditor.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div id="TripsEditor">
        <div class="Section EmphasizeContent">
            <h2>Start importing a new trip</h2>
            <% using(Html.BeginForm("StartNewImport", "Import", FormMethod.Post, new { style = "display: inline;" })) { %>
                <input type="submit" value="Import a new trip" class="ImportAddTripButton" />
            <% } %>
            <% if (Model.LastSavedTripNotYetImported != null) { %>
                or 
                <% using(Html.BeginForm("ContinueLastImport", "Import", FormMethod.Post, new { style = "display: inline;" })) { %>
                    <button type="submit" class="ImportEditButton" style="float: none;">Continue where you left off</button>
                <% } %>
            <% } %>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="Section EmphasizeContent">
            <h2>Finish importing trips you've already started</h2>
            <% if (Model.UserTripsNotYetImported.Count == 0) { %>
                <p>You have no unfinished imports.</p>
            <% } %>
            <% for (int i = 0; i < Model.UserTripsNotYetImported.Count; i++) { %>
                <% Html.RenderPartial("TripSummary",
                       Model.UserTripsNotYetImported[i],
                       new ViewDataDictionary(ViewData) { { "Edit", true }, { "TripIndex", i } }); %>
                <% if ((i + 1) % 3 == 0) { %>
                    <div class="ui-helper-clearfix"></div>
                <% } %>
            <% } %>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="Section EmphasizeContent">
            <h2>View trips you've finished importing</h2>
            <% if (Model.UserTripsAlreadyImported.Count == 0) { %>
                <p>You haven't finished importing any trips yet.</p>
            <% } %>
            <% for (int i = 0; i < Model.UserTripsAlreadyImported.Count; i++) { %>
                <% Html.RenderPartial("TripSummary", 
                       Model.UserTripsAlreadyImported[i],
                       new ViewDataDictionary(ViewData) { { "Imported", true }, { "TripIndex", i } }); %>
                <% if ((i + 1) % 3 == 0) { %>
                    <div class="ui-helper-clearfix"></div>
                <% } %>
            <% } %>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
</asp:Content>