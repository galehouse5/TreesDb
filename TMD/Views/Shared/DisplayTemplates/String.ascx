<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<String>" %>
<td class="description">
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m) %>
    <% } %>
</td>
<td class="value">
    <% if (ViewData.ContainsKey("empty") && string.IsNullOrEmpty(Model)) { %>
        <%: ViewData["empty"] %>
    <% } else if (ViewData.ContainsKey("highlight") && !(bool)ViewData["highlight"]) { %>
        <%: Model %>
    <% } else { %>
        <span>
            <%: Model %>
        </span>
    <% } %>
</td>
