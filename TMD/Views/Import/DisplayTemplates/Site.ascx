<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSiteModel>" %>
<div class="portlet x12 Site">        
    <div class="portlet-header Entity-Header Site-Header">
        <h4><%: Model.Name %></h4>
        <div class="actions">
            <button type="submit" class="btn btn-orange btn-small" name="innerAction" value="Site.<%= Model.Id %>.Edit">Edit</button>
        </div>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <% if (Model.Subsites.Count == 1) { %>
            <ul>
                <li><%= Html.DisplayFor(m => m.Subsites[0].State) %></li>
                <li><%= Html.DisplayFor(m => m.Subsites[0].County) %></li>
                <li><%= Html.DisplayFor(m => m.Subsites[0].OwnershipType) %></li>
            </ul>
        <% } else { %>
            <% for (int i = 0; i < Model.Subsites.Count; i++) { %>
                <%= Html.DisplayFor(m => m.Subsites[i], "Subsite") %>
            <% } %>
        <% } %>
    </div>
</div>
