<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportTreesModel>" %>
<%@ Import Namespace="TMD.Model.Imports" %>
<% for (int site = 0; site < Model.Sites.Count; site++) { %>
    <% for (int subsite = 0; subsite < Model.Sites[site].Subsites.Count; subsite++) { %>
        <% if (Model.Sites[site].Subsites[subsite].Id.Equals(ViewData["subsiteId"])) { %>
            <% if (Model.Sites[site].Subsites.Count == 1) { %>
                <%= Html.EditorFor(m => m.Sites[site], "SiteTrees") %>
            <% } else { %>
                <%= Html.EditorFor(m => m.Sites[site].Subsites[subsite], "SubsiteTrees") %>
            <% } %>
        <% } %>
    <% } %>
<% } %>
