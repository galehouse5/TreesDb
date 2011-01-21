<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trees.Tree>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<table class="reports_table" style="width: 300px;">
    <tr><td colspan="2"><strong><%: Model.ScientificName %></strong></td></tr>
    <%= Html.DisplayFor(m => m.CommonName, new { label = "Common name" }) %>
    <% if (Model.Height.IsSpecified) { %>
        <tr><%= Html.DisplayFor(m => m.Height, new { format = DistanceFormat.Default })%></tr>
    <% } %>
    <% if (Model.Girth.IsSpecified) { %>
        <tr><%= Html.DisplayFor(m => m.Girth, new { format = DistanceFormat.Default })%></tr>
    <% } %>
    <% if (Model.CrownSpread.IsSpecified) { %>
        <tr><%= Html.DisplayFor(m => m.CrownSpread, new { label = "Crown spread", format = DistanceFormat.Default })%></tr>
    <% } %>
    <% if (Model.TDI3.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.TDI3.Value, new { label = "TDI3" })%></tr>
    <% } %>
    <% if (Model.TDI2.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.TDI2.Value, new { label = "TDI2" })%></tr>
    <% } %>
    <% if (Model.ENTSPTS2.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.ENTSPTS2.Value, new { label = "ENTSPTS2" }) %></tr>
    <% } %>
    <% if (Model.ENTSPTS.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.ENTSPTS.Value, new { label = "ENTSPTS" }) %></tr>
    <% } %>
    <% if (Model.ChampionPoints.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.ChampionPoints, new { label = "Champion points" })%></tr>
    <% } else if (Model.AbbreviatedChampionPoints.HasValue) { %>
        <tr><%= Html.DisplayFor(m => m.AbbreviatedChampionPoints, new { label = "Champion points (abbreviated)" })%></tr>
    <% } %>
    <% if (Model.Photos.Count > 0) { %>
        <tr>
            <td class="description">Photos</td>
            <td class="value">
                <% foreach (var photo in Model.Photos) { %>
                    <img src="<%= Url.Action("View", "Photos", new { id = photo.PhotoId, size = EPhotoSize.Square }) %>" alt="" />
                <% } %>
            </td>
        </tr>
    <% } %>
    <tr><%= Html.DisplayFor(m => m.LastMeasured, new { label = "Measured" })%></tr>
</table>