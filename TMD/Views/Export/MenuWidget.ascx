<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ExportMenuWidgetModel>" %>
<% if (Model.CanExport) { %>
    <li class="mega <%= Model.IsSelected ? "mega-current" : string.Empty %>">
        <%= Html.ActionLink("Export", "Index", "Export", null, new { @class = "mega-link" })%>
    </li>
<% } %>