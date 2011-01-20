<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Int32>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <% if (!string.IsNullOrWhiteSpace(ViewData["label"].ToString())) { %>
            <%: ViewData["label"] %>:
        <% } %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>:
    <% } %>
</strong>
<%: Model %>
