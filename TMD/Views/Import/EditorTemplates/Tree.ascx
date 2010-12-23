<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportTreeModel>" %>
<div class="portlet x12 Site">        
    <div class="portlet-header">
        <h4>Enter tree</h4>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <%= Html.HiddenFor(m => m.IsEditing) %>
        <%= Html.HiddenFor(m => m.IsRemovable) %>
        <%= Html.EditorFor(m => m.CommonName, new { required = true }) %>
        <div class="buttonrow">
            <button type="submit" class="btn Save" name="innerAction" value="Tree.<%= Model.Id %>.Save">Save</button>
            <% if (Model.IsRemovable) { %>
                <button type="submit" class="btn btn-grey Remove" name="innerAction" value="Tree.<%= Model.Id %>.Remove">Remove</button>
            <% } %>
        </div>
    </div>
</div>
