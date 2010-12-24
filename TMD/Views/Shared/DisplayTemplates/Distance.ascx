<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Distance>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText<Distance, Distance>(m => m)%>:
    <% } %>
</strong>
<%: Model %>
