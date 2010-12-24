<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportTreeModel>" %>
<div class="portlet x12 Tree">        
    <div class="portlet-header Entity-Header Tree-Header">
        <h4><%: Model.ScientificName %></h4>
        <div class="actions">
            <button type="submit" class="btn btn-orange btn-small" name="innerAction" value="Tree.<%= Model.Id %>.Edit">Edit</button>
        </div>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <ul>
            <li><%= Html.DisplayFor(m => m.CommonName) %></li>
            <% if (Model.Height.IsSpecified) { %>
                <li><%= Html.DisplayFor(m => m.Height) %></li>
            <% } %>
            <% if (Model.Girth.IsSpecified) { %>
                <li><%= Html.DisplayFor(m => m.Girth) %></li>
            <% } %>
            <% if (Model.CrownSpread.IsSpecified) { %>
                <li><%= Html.DisplayFor(m => m.CrownSpread) %></li>
            <% } %>
        </ul>
    </div>
</div>
