<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportFinishedTreeModel>" %>
<div class="portlet x12 Tree">        
    <div class="portlet-header Entity-Header Tree-Header">
        <h4><%: Model.ScientificName %></h4>
    </div>
    <div class="portlet-content">
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
