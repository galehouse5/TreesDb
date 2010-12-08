<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportMenuWidgetModel>" %>
<% if (Model.CanImport) {  %>
    <li class="mega <%= Model.IsSelected ? "mega-current" : string.Empty %>">
        <a href="javascript:;" class="mega-tab hasSub">Import</a>
        <div class="mega-content mega-menu ">						
            <ul>
	            <li><a href="/Import/Start">Start</a></li>	
                <% if (Model.LatestTrip != null && !Model.LatestTrip.IsImported) { %>
                    <li><%= Html.ActionLink("Continue where I left off", "Trip", new { id = Model.LatestTrip.Id }) %> </li>
                <% } %>
                <li><a href="/Import/History">View history</a></li>	
            </ul>
        </div>
    </li>
<% } %>


