<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<String>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m) %>:
    <% } %>
</strong>
<% if (ViewData.ContainsKey("empty") && string.IsNullOrEmpty(Model)) { %>
    <%: ViewData["empty"] %>
<% } else { %>
    <%: Model %>
<% } %>
