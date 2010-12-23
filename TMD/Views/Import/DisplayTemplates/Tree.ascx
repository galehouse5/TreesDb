<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportTreeModel>" %>
<div class="portlet x12 Site">        
    <div class="portlet-header Entity-Header Tree-Header">
        <h4><%: Model.CommonName %></h4>
        <div class="actions">
            <button type="submit" class="btn btn-orange btn-small" name="innerAction" value="Tree.<%= Model.Id %>.Edit">Edit</button>
        </div>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        hello world
    </div>
</div>
