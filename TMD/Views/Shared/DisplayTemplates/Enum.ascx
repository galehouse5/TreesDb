<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <% if (!string.IsNullOrWhiteSpace(ViewData["label"].ToString())) { %>
            <%: ViewData["label"] %>:
        <% } %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>:
    <% } %>
</strong>
<% if (ViewData.ContainsKey("empty") && string.IsNullOrEmpty((Model as Enum).Describe())) { %>
    <%: ViewData["empty"] %>
<% } else { %>
    <%: (Model as Enum).Describe() %>
<% } %>


