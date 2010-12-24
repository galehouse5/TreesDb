<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<DateTime>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText<DateTime, DateTime>(m => m)%>:
    <% } %>
</strong>
<%: Model.ToString("MM/dd/yyyy") %>
