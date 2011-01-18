<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trees.Tree>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<ul>
    <li><strong><%: Model.ScientificName %></strong></li>
    <li><%= Html.DisplayFor(m => m.CommonName, new { label = "Common name" })%></li>
    <% if (Model.Height.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.Height, new { format = DistanceFormat.Default })%></li>
    <% } %>
    <% if (Model.Girth.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.Girth, new { format = DistanceFormat.Default })%></li>
    <% } %>
    <% if (Model.CrownSpread.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.CrownSpread, new { label = "Crown spread", format = DistanceFormat.Default })%></li>
    <% } %>
    <% if (Model.Elevation.IsSpecified) { %>
        <li><%= Html.DisplayFor(m => m.Elevation, new { format = ElevationFormat.Default }) %></li>
    <% } %>
    <% if (Model.TDI2.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.TDI2.Value, new { label = "TDI2" })%></li>
    <% } %>
    <% if (Model.TDI3.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.TDI3.Value, new { label = "TDI3" })%></li>
    <% } %>
    <% if (Model.ENTSPTS2.HasValue) { %>
        <li><%= Html.DisplayFor(m => m.ENTSPTS2.Value, new { label = "ENTSPTS2" }) %></li>
    <% } %>
    <li><%= Html.DisplayFor(m => m.LastMeasured, new { label = "Last measured" })%><% if (Model.MeasurementCount > 1) { %> (<%= Model.MeasurementCount%>)<% } %></li>
</ul>
<% foreach (var photo in Model.Photos) { %>
    <img src="<%= Url.Action("View", "Photos", new { id = photo.PhotoId, size = EPhotoSize.Square }) %>" alt="" />
<% } %>