<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Elevation>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>:
    <% } %>
</strong>
<% if (ViewData.ContainsKey("format")) { %>
    <%: Model.ToString((ElevationFormat)ViewData["format"]) %>
<% } else { %>
    <%: Model %>
<% } %>
