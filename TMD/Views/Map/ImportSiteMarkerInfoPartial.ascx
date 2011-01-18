<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Imports.Site>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<ul>
    <li><strong><%: Model.Name %></strong></li>
</ul>
<% if (Model.Subsites.Count == 1) { %>
    <% foreach (var photo in Model.Subsites[0].Photos) { %>
        <img src="<%= Url.Action("View", "Photos", new { id = photo.PhotoId, size = EPhotoSize.Square }) %>" alt="" />
    <% } %>
<% } %>