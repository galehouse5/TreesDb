<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportFinishedSubsiteModel>" %>
<div class="portlet x12 Subsite">        
    <div class="portlet-header Entity-Header Subsite-Header">
        <h4><%: Model.Name %></h4>
    </div>
    <div class="portlet-content">
        <ul>
            <li><%= Html.DisplayFor(m => m.State) %></li>
            <li><%= Html.DisplayFor(m => m.County) %></li>
            <li><%= Html.DisplayFor(m => m.OwnershipType) %></li>
        </ul>
        <% if (Model.Photos.HasPhotos) {  %>
            <%= Html.DisplayFor(m => m.Photos) %>
        <% } %>
        <% for (int i = 0; i < Model.Trees.Count; i++) { %>
            <%= Html.DisplayFor(m => m.Trees[i], "FinishedTree") %>
        <% } %>
    </div>
</div>
