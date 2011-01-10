<%@ Page Title="Import History" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<IList<Trip>>" %>
<%@ Import Namespace="TMD.Model.Imports" %>

<asp:Content ContentPlaceHolderID="Styles" runat="server">
    <%= Html.VersionedLink("/css/Import.css", new { rel = "stylesheet", type = "text/css" })%>
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% var tripsPendingImport = Model.Where(m => !m.IsImported).ToList(); %>
    <% if (tripsPendingImport.Count > 0) { %>
        <div class="portlet x12 Trips">
            <div class="portlet-header">
                <h4>Started imports</h4>
            </div>
            <div class="portlet-content">
                <% using(Html.BeginForm()) { %>
                    <% for (int i = 0; i < tripsPendingImport.Count; i++) { %>
                        <%= Html.EditorFor(m => m[Model.IndexOf(tripsPendingImport[i])], "Trip")%>
                    <% } %>
                <% } %>
            </div>
        </div>
    <% } %>
    <% var importedTrips = Model.Where(m => m.IsImported).ToList(); %>
    <% if (importedTrips.Count > 0) { %>
        <div class="portlet x12 Trips">
            <div class="portlet-header">
                <h4>Finished imports</h4>
            </div>
            <div class="portlet-content">
                <% for(int i = 0; i < importedTrips.Count; i++) { %>
                    <%= Html.EditorFor(m => m[Model.IndexOf(importedTrips[i])], "Trip")%>
                <% } %>
            </div>
        </div>
    <% } %>
</asp:Content>

