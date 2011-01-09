<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSiteTreesModel>" %>
<div class="portlet x12 <% if (Model.HasSingleSubsite) { %>Site Subsite<% } else { %>Site<% } %>">        
    <div class="portlet-header Entity-Header Site-Header">
        <h4><%: Model.Name %></h4>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <% if (Model.HasSingleSubsite) { %>
            <%= Html.HiddenFor(m => m.Subsites[0].Id) %>
            <% for (int i = 0; i < Model.Subsites[0].Trees.Count; i++) { %>
                <% if (Model.Subsites[0].Trees[i].IsEditing) { %>
                    <%= Html.EditorFor(m => m.Subsites[0].Trees[i], "Tree") %>
                <% } else { %>
                    <%= Html.DisplayFor(m => m.Subsites[0].Trees[i], "Tree") %>
                <% } %>
            <% } %>
            <div class="buttonrow">
                <button type="submit" class="btn btn-orange Add" name="innerAction" value="Subsite.<%= Model.Subsites[0].Id %>.Add">Add tree</button>
            </div>
        <% } else { %>
            <% for (int i = 0; i < Model.Subsites.Count; i++) { %>
                <%= Html.EditorFor(m => m.Subsites[i], "SubsiteTrees") %>
            <% } %>
        <% } %>
    </div>
</div>
