<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<MapMenuWidgetModel>" %>
<li class="mega <%= Model.IsSelected ? "mega-current" : string.Empty %>">
    <%= Html.ActionLink("Map", "Index", "Map", null, new { @class = "mega-link" })%>
</li>
