<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Nullable<Single>>" %>
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
    <% if (ViewData.ContainsKey("empty") && !Model.HasValue) { %>
        <%: ViewData["empty"] %>
    <% } else if (ViewData.ContainsKey("highlight") && !(bool)ViewData["highlight"]) { %>
        <%: Model %>
    <% } else { %>
        <span>
            <%: Model %>
        </span>
    <% } %>
</td>
