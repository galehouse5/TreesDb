<%@ Page Title="Import" Language="C#" Inherits="System.Web.Mvc.ViewPage<IList<TMD.Model.Trips.Trip>>" MasterPageFile="~/Views/Shared/Site.Master" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="stylesheet" href="/Styles/Import.css" />
<link type="text/css" rel="stylesheet" href="/Styles/Trip.css" />
<script type="text/javascript" src="/Scripts/Trip/Trip.js"></script>
<script type="text/javascript" src="/Scripts/Import/Index.js"></script>
<script type="text/javascript" src="/Scripts/Import/TripsEditor.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="TripWidgetContainer">
        <div class="Section EmphasizeContent">
            <h2>Start importing a new trip</h2>
            <% using(Html.BeginForm("Create", "Import", FormMethod.Post, new { style = "display: inline;" })) { %>
                <input type="submit" value="Import a new trip" class="Add" />
            <% } %>
            <% if (Model.Count > 0 && !Model[0].IsImported) { %>
                or 
                <%= Html.ActionLink("Continue where you left off", "Continue", "Import", new { id = Model[0].Id }, new { @class = "Edit", style = "float: none;" })  %>
            <% } %>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="Section EmphasizeContent">
            <h2>Finish importing trips you've already started</h2>
            <% if (Model.Count(t => !t.IsImported) == 0) { %>
                <p>You have no unfinished imports.</p>
            <% } %>
            <% int i = 0; %>
            <% foreach (Trip t in Model.Where(m => !m.IsImported)) { %>
                <% Html.RenderAction("Widget", "Trip", new { id = t.Id, options = ETripWidgetOptions.Edit }); %>
                <% if ((i + 1) % 3 == 0) { %>
                    <div class="ui-helper-clearfix"></div>
                <% } %>
                <% i++; %>
            <% } %>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="Section EmphasizeContent">
            <h2>View trips you've finished importing</h2>
            <% if (Model.Count(t => t.IsImported) == 0) { %>
                <p>You haven't finished importing any trips yet.</p>
            <% } %>
            <% int j = 0; %>
            <% foreach (Trip t in Model.Where(m => m.IsImported)) { %>
                <% Html.RenderAction("Widget", "Trip", new { id = t.Id, options = ETripWidgetOptions.View }); %>
                <% if ((j + 1) % 3 == 0) { %>
                    <div class="ui-helper-clearfix"></div>
                <% } %>
                <% j++; %>
            <% } %>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
</asp:Content>