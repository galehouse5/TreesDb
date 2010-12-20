<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<String>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText<string, string>(m => m) %>:
    <% } %>
</strong>
<%: Model %>
