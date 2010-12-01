<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportMenuWidgetModel>" %>
<% if (Model.CanImport) {  %>
    <li class="mega <%= Model.IsSelected ? "mega-current" : string.Empty %>">
        <a href="javascript:;" class="mega-tab hasSub">Import</a>
        <div class="mega-content mega-menu ">						
            <ul>
	            <li><%= Html.ActionLink("Start", "Start", "Import") %></li>	
                <% if (Model.LatestTrip != null && !Model.LatestTrip.IsImported) { %>
                    <li><%= Html.ActionLink("Continue where I left off", "Trip", new { id = Model.LatestTrip.Id }) %> </li>
                <% } %>
                <li><%= Html.ActionLink("View history", "History", "Import") %></li>	
            </ul>
        </div>
    </li>
<% } %>


