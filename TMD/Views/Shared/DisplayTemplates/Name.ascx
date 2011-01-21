<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Name>" %>
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
        <%: Model.ToFormalName() %>
    <% } else { %>
        <span>
            <%: Model.ToFormalName() %>
        </span>
    <% } %>
</td>
