<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportTreesModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<% for (int site = 0; site < Model.Sites.Count; site++) { %>
    <% for (int subsite = 0; subsite < Model.Sites[site].Subsites.Count; subsite++) { %>
        <% for (int tree = 0; tree < Model.Sites[site].Subsites[subsite].Trees.Count; tree++) { %>
            <% if (Model.Sites[site].Subsites[subsite].Trees[tree].Id.Equals(ViewData["treeId"])) { %>
                <% if (Model.Sites[site].Subsites[subsite].Trees[tree].IsEditing) { %>
                    <%= Html.EditorFor(m => m.Sites[site].Subsites[subsite].Trees[tree], "Tree")%>
                <% } else { %>
                    <%= Html.DisplayFor(m => m.Sites[site].Subsites[subsite].Trees[tree], "Tree")%>
                <% } %>
            <% } %>
        <% } %>
    <% } %>
<% } %>
