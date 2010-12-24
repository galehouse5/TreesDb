<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportTreeModel>" %>
<div class="portlet x12 Tree">        
    <div class="portlet-header">
        <h4>Enter tree</h4>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <%= Html.HiddenFor(m => m.IsEditing) %>
        <%= Html.HiddenFor(m => m.EditMode) %>
        <% if (Model.EditMode == EImportTreeModelEditMode.Simple) { %>
            <%= Html.EditorFor(m => m.CommonName, new { required = true }) %>
            <%= Html.EditorFor(m => m.ScientificName, new { required = true }) %>
            <%= Html.EditorFor(m => m.Height) %>
            <%= Html.EditorFor(m => m.HeightMeasurementMethod, "Enum") %>
            <%= Html.EditorFor(m => m.Girth) %>
            <%= Html.EditorFor(m => m.CrownSpread) %>
            <%= Html.EditorFor(m => m.Coordinates) %>
            <%= Html.EditorFor(m => m.Elevation) %>
            <%= Html.EditorFor(m => m.GeneralComments, new { rows = 5 })%>
        <% } else { %>
            <div class="portlet x12 TreeSection">
                <div class="portlet-header">
                    <h4>Enter general information</h4>
                </div>
                <div class="portlet-content">
                    <%= Html.EditorFor(m => m.CommonName, new { required = true }) %>
                    <%= Html.EditorFor(m => m.ScientificName, new { required = true }) %>
                    <%= Html.EditorFor(m => m.Height) %>
                    <%= Html.EditorFor(m => m.HeightMeasurementMethod, "Enum") %>
                    <%= Html.EditorFor(m => m.Girth) %>
                    <%= Html.EditorFor(m => m.CrownSpread) %>
                    <%= Html.EditorFor(m => m.Coordinates) %>
                    <%= Html.EditorFor(m => m.Elevation) %>
                    <%= Html.EditorFor(m => m.GeneralComments, new { rows = 5 })%>
                </div>
            </div>
        <%} %>
        <div class="buttonrow">
            <button type="submit" class="btn Save" name="innerAction" value="Tree.<%= Model.Id %>.Save">Save</button>
            <% if (Model.IsRemovable) { %>
                <button type="submit" class="btn btn-grey Remove" name="innerAction" value="Tree.<%= Model.Id %>.Remove">Remove</button>
            <% } %>
            <% if (Model.EditMode == EImportTreeModelEditMode.Simple) { %>
                <button type="submit" class="btn btn-orange" name="innerAction" value="Tree.<%= Model.Id %>.AdvancedEdit">Advanced edit</button>
            <% } %>
        </div>
    </div>
</div>
