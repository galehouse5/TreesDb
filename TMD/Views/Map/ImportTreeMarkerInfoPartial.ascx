<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Imports.TreeBase>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<ul>
    <li><strong><%: Model.ScientificName %></strong></li>
    <li><%= Html.DisplayFor(m => m.CommonName, new { label = "Common name" })%></li>
    <% if (Model.Height.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.Height) %></li>
    <% } %>
    <% if (Model.Girth.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.Girth) %></li>
    <% } %>
    <% if (Model.CrownSpread.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.CrownSpread, new { label = "Crown spread" })%></li>
    <% } %>
</ul>
<% foreach (var photo in Model.Photos) { %>
    <img src="<%= Url.Action("View", "Photos", new { id = photo.GlobalId, size = EPhotoSize.Square }) %>" alt="" />
<% } %>

