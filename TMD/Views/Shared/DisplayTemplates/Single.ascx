<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Single>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m) %>:
    <% } %>
</strong>
<%: Model %>
