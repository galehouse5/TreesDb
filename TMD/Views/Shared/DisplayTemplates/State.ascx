<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<State>" %>
<%@ Import Namespace="TMD.Model.Locations" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <% if (!string.IsNullOrWhiteSpace(ViewData["label"].ToString())) { %>
            <%: ViewData["label"] %>:
        <% } %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>:
    <% } %>
</strong>
<%: Model.Name %>, <%: Model.Country.Name %>