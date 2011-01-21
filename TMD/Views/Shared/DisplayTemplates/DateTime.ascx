<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<DateTime>" %>
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
        <%: Model.ToString("MM/dd/yyyy") %>
    <% } else { %>
        <span>
            <%: Model.ToString("MM/dd/yyyy") %>
        </span>
    <% } %>
</td>
 