<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Sites.Site>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<ul>
    <li><strong><%: Model.Name %></strong></li>
    <% if (Model.Subsites.Count == 1) { %>
        <li><%= Html.DisplayFor(m => m.Subsites[0].State) %></li>
        <li><%= Html.DisplayFor(m => m.Subsites[0].County)%></li>
        <li><%= Html.DisplayFor(m => m.Subsites[0].OwnershipType, new { label = "Ownership type" })%></li>
    <% } %>
    <% if (Model.RHI5.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.RHI5.Value, new { label = "RHI5" }) %></li>
    <% } %>
    <% if (Model.RHI10.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.RHI10.Value, new { label = "RHI10" }) %></li>
    <% } %>
    <% if (Model.RHI20.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.RHI20.Value, new { label = "RHI20" }) %></li>
    <% } %>
    <% if (Model.RGI5.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.RGI5.Value, new { label = "RGI5" }) %></li>
    <% } %>
    <% if (Model.RGI10.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.RGI10.Value, new { label = "RGI10" }) %></li>
    <% } %>
    <% if (Model.RGI20.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.RGI20.Value, new { label = "RGI20" }) %></li>
    <% } %>
    <li><%= Html.DisplayFor(m => m.TreesMeasured, new { label = "Trees measured" })%></li>
     <% if (Model.Subsites.Count > 1) { %>
        <li><%= Html.DisplayFor(m => m.Subsites.Count, new { label = "Subsites visited" }) %></li>
    <% } %>
    <li><%= Html.DisplayFor(m => m.LastVisited, new { label = "Last visited" })%><% if (Model.VisitCount > 1) { %> (<%= Model.VisitCount %>)<% } %></li>
</ul>
<% if (Model.Subsites.Count == 1) { %>
    <% foreach (var photo in Model.Subsites[0].Photos) { %>
        <img src="<%= Url.Action("View", "Photos", new { id = photo.GlobalId, size = EPhotoSize.Square }) %>" alt="" />
    <% } %>
<% } %>