<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSiteModel>" %>
<div class="portlet x12 Site">        
    <div class="portlet-header">
        <h4>Enter site</h4>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <%= Html.HiddenFor(m => m.IsEditing) %>
        <%= Html.HiddenFor(m => m.IsSaveableAndRemovable) %>
        <% if (Model.HasSingleSubsite) { %>
            <%= Html.HiddenFor(m => m.Subsites[0].Id) %>
            <%= Html.EditorFor(m => m.Subsites[0].Name, new { required = true })%>
            <%= Html.EditorFor(m => m.Subsites[0].State, new { required = true })%>
            <%= Html.EditorFor(m => m.Subsites[0].County, new { required = true })%>
            <%= Html.EditorFor(m => m.Subsites[0].OwnershipType, new { required = true })%>
            <%= Html.EditorFor(m => m.Subsites[0].Coordinates, new { helpText = "Latitude, Longitude" })%>
            <%= Html.EditorFor(m => m.Subsites[0].OwnershipContactInfo, new { rows = 5 })%>
            <%= Html.EditorFor(m => m.Subsites[0].MakeOwnershipContactInfoPublic)%>
            <%= Html.EditorFor(m => m.Subsites[0].Comments, new { rows = 5 })%>
        <% } else { %>
            <%= Html.EditorFor(m => m.Name, new { required = true })%>
            <%= Html.EditorFor(m => m.Coordinates, new { helpText = "Latitude, Longitude" })%>
            <%= Html.EditorFor(m => m.Comments,  new { rows = 5 })%>
            <% for (int i = 0; i < Model.Subsites.Count; i++) { %>
                <%= Html.EditorFor(m => m.Subsites[i], "Subsite") %>
            <% } %>
        <% } %>
        <div class="buttonrow">
            <%  %>
            <% if (Model.IsSaveableAndRemovable) { %>
                <button type="submit" class="btn Save" name="innerAction" value="Site.<%= Model.Id %>.Save">Save</button>
                <button type="submit" class="btn btn-grey Remove" name="innerAction" value="Site.<%= Model.Id %>.Remove">Remove</button>
            <% } %>
            <button type="submit" class="btn btn-orange Add" name="innerAction" value="Site.<%= Model.Id %>.Add">Add subsite</button>
        </div>
    </div>
</div>
