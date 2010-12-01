<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<MainMenuWidgetModel>" %>
<li class="mega <%= Model.IsSelected ? "mega-current" : string.Empty %>">
    <%= Html.ActionLink("Home", "Index", "Main", null ,new { @class = "mega-link" }) %>
</li>


