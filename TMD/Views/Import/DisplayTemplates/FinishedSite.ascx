<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportFinishedSiteModel>" %>
<div class="portlet x12 Site">        
    <div class="portlet-header Entity-Header Site-Header">
        <h4><%: Model.Name %></h4>
    </div>
    <div class="portlet-content">
        <% if (Model.HasSingleSubsite) { %>
            <ul>
                <li><%= Html.DisplayFor(m => m.Subsites[0].State) %></li>
                <li><%= Html.DisplayFor(m => m.Subsites[0].County) %></li>
                <li><%= Html.DisplayFor(m => m.Subsites[0].OwnershipType) %></li>
            </ul>
            <% for (int i = 0; i < Model.Subsites[0].Trees.Count; i++) { %>
                <%= Html.DisplayFor(m => m.Subsites[0].Trees[i], "FinishedTree") %>
            <% } %>
        <% } else { %>
            <% for (int i = 0; i < Model.Subsites.Count; i++) { %>
                <%= Html.DisplayFor(m => m.Subsites[i], "FinishedSubsite") %>
            <% } %>
        <% } %>
    </div>
</div>
