﻿<%@ Page Title="Import" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<IList<Trip>>" %>
<%@ Import Namespace="TMD.Model.Imports" %>

<asp:Content ContentPlaceHolderID="Styles" runat="server">
    <link rel="stylesheet" href="/css/Import.css" type="text/css" />
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="portlet x12">
        <div class="portlet-header">
            <h4>New import</h4>
        </div>
        <div class="portlet-content">
            <% using (Html.BeginForm("New", "Import", FormMethod.Post, new { @class = "form" })) { %>
                <%= Html.Partial("StartPartial") %>
                <div class="buttonrow">
                    <button type="submit" class="btn">Start</button>
                </div>
            <% } %>
        </div>
    </div>
    <% var tripsPendingImport = Model.Where(m => !m.IsMerged).ToList(); %>
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
    <% var importedTrips = Model.Where(m => m.IsMerged).ToList(); %>
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
