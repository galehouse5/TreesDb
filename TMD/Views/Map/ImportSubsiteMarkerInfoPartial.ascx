<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Imports.Subsite>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<ul>
    <li><strong><%: Model.Name %></strong></li>
    <li><%= Html.DisplayFor(m => m.State) %></li>
    <li><%= Html.DisplayFor(m => m.County) %></li>
    <li><%= Html.DisplayFor(m => m.OwnershipType, new { label = "Ownership type" })%></li>
</ul>
<% foreach (var photo in Model.Photos) { %>
    <img src="<%= Url.Action("View", "Photos", new { id = photo.Id, size = EPhotoSize.Square }) %>" alt="" />
<% } %>
