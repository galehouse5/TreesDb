<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSitesModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<% for (int i = 0; i < Model.Sites.Count; i++) { %>
    <% if (Model.Sites[i].Id.Equals(ViewData["siteId"])) { %>
        <% if (Model.Sites[i].IsEditing) { %>
            <%= Html.EditorFor(m => m.Sites[i], "Site") %>
        <% } else { %>
            <%= Html.DisplayFor(m => m.Sites[i], "Site") %>
        <% } %>
    <% } %>
<% } %>