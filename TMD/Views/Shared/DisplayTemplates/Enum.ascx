<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
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
    <% if (ViewData.ContainsKey("empty") && string.IsNullOrEmpty((Model as Enum).Describe())) { %>
        <%: ViewData["empty"] %>
    <% } else if (ViewData.ContainsKey("highlight") && !(bool)ViewData["highlight"]) { %>
        <%: (Model as Enum).Describe() %>
    <% } else { %>
        <span>
           <%: (Model as Enum).Describe() %>
        </span>
    <% } %>
</td>
 