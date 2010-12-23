<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSubsiteTreesModel>" %>
<div class="portlet x12 Subsite">        
    <div class="portlet-header Entity-Header Subsite-Header">
        <h4><%: Model.Name %></h4>
    </div>
    <div class="portlet-content">
        <% for (int i = 0; i < Model.Trees.Count; i++) { %>
            <% if (Model.Trees[i].IsEditing) { %>
                <%= Html.EditorFor(m => m.Trees[i], "Tree") %>
            <% } else { %>
                <%= Html.DisplayFor(m => m.Trees[i], "Tree") %>
            <% } %>
        <% } %>
        <div class="buttonrow">
            <button type="submit" class="btn btn-orange Add" name="innerAction" value="Subsite.<%= Model.Id %>.Add">Add tree</button>
        </div>
    </div>
</div>
