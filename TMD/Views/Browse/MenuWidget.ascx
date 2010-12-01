<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<BrowseMenuWidgetModel>" %>
<li class="mega <%= Model.IsSelected ? "mega-current" : string.Empty %>">
    <%= Html.ActionLink("Browse", "Index", "Browse", null, new { @class = "mega-tab hasSub" })%>
    <div class="mega-content mega-menu ">						
        <ul>
	        <li><%= Html.ActionLink("By trees", "Index", "Browse", new { by = "trees" }, null) %></li>	
            <li><%= Html.ActionLink("By sites", "Index", "Browse", new { by = "sites" }, null) %></li>	
            <li><%= Html.ActionLink("By trips", "Index", "Browse", new { by = "trips" }, null) %></li>				
        </ul>
    </div>	
</li>