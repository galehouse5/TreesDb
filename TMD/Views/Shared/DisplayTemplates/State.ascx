<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<State>" %>
<%@ Import Namespace="TMD.Model.Locations" %>
<td class="description">
    <% if (ViewData.ContainsKey("label")) { %>
        <% if (!string.IsNullOrWhiteSpace(ViewData["label"].ToString())) { %>
            <%: ViewData["label"] %>
        <% } %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>
    <% } %>
</td>
<td class="value">
    <% if (ViewData.ContainsKey("highlight") && !(bool)ViewData["highlight"]) { %>
        <%= Model.Name %>
    <% } else { %>
        <span><%= Model.Name %></span>
    <% } %>
</td>
