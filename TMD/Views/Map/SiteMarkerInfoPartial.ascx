<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Sites.Site>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<table class="reports_table" style="width: 300px;">
    <tr><td colspan="2"><strong><%: Model.Name %></strong></td></tr>
    <% if (Model.Subsites.Count == 1) { %>
        <tr><%= Html.DisplayFor(m => m.Subsites[0].State) %></tr>
        <tr><%= Html.DisplayFor(m => m.Subsites[0].County)%></tr>
        <tr><%= Html.DisplayFor(m => m.Subsites[0].OwnershipType, new { label = "Ownership type" })%></tr>
    <% } %>
    <% if (Model.RHI5.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.RHI5.Value, new { label = "RHI5" }) %></tr>
    <% } %>
    <% if (Model.RHI10.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.RHI10.Value, new { label = "RHI10" }) %></tr>
    <% } %>
    <% if (Model.RHI20.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.RHI20.Value, new { label = "RHI20" }) %></tr>
    <% } %>
    <% if (Model.RGI5.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.RGI5.Value, new { label = "RGI5" }) %></tr>
    <% } %>
    <% if (Model.RGI10.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.RGI10.Value, new { label = "RGI10" }) %></tr>
    <% } %>
    <% if (Model.RGI20.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.RGI20.Value, new { label = "RGI20" }) %></tr>
    <% } %>
    <tr><%= Html.DisplayFor(m => m.TreesMeasured, new { label = "Trees" })%></tr>
    <% if (Model.Subsites.Count > 1) { %>
        <tr><%= Html.DisplayFor(m => m.Subsites.Count, new { label = "Subsites" }) %></tr>
    <% } %>
    <% if (Model.Subsites.Count == 1 && Model.Subsites[0].Photos.Count > 0) { %>
        <tr>
            <td class="description">Photos</td>
            <td class="value">
                <% foreach (var photo in Model.Subsites[0].Photos) { %>
                    <img src="<%= Url.Action("View", "Photos", new { id = photo.PhotoId, size = EPhotoSize.Square }) %>" alt="" />
                <% } %>
            </td>
        </tr>
    <% } %>
    <tr><%= Html.DisplayFor(m => m.LastVisited, new { label = "Visited" })%></tr>
</table>