<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<State>" %>
<%@ Import Namespace="TMD.Model.Locations" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText<State, State>(m => m)%>:
    <% } %>
</strong>
<%: Model.Name %>, <%: Model.Country.Name %>