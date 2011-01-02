<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.TreeMeasurementBase>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<ul>
    <li><strong><%: Model.ScientificName %></strong></li>
    <li><%= Html.DisplayFor(m => m.CommonName) %></li>
    <% if (Model.Height.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.Height) %></li>
    <% } %>
    <% if (Model.Girth.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.Girth) %></li>
    <% } %>
    <% if (Model.CrownSpread.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.CrownSpread) %></li>
    <% } %>
</ul>
<% foreach (var photo in Model.Photos) { %>
    <img src="<%= Url.Action("View", "Photo", new { id = photo.Id, size = EPhotoSize.Square }) %>" alt="" />
<% } %>

