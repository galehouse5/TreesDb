<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportMenuWidgetModel>" %>
<% if (Model.CanImport) {  %>
    <li class="mega <%= Model.IsSelected ? "mega-current" : string.Empty %>">
        <%= Html.ActionLink("Import", "Index", "Import", null, new { @class="mega-tab hasSub" })%>
        <div class="mega-content mega-menu ">						
            <ul>
	            <li><%= Html.ActionLink("New", "New") %></li>	
                <% if (Model.LatestTrip != null && !Model.LatestTrip.IsImported) { %>
                    <li><%= Html.ActionLink("Continue", "Trip", new { id = Model.LatestTrip.Id }) %> </li>
                <% } %>
                <li><%= Html.ActionLink("History", "History") %></li>	
            </ul>
        </div>
    </li>
<% } %>


