<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSubsiteModel>" %>
<div class="portlet x12 Subsite">        
    <div class="portlet-header">
        <h4>Enter subsite</h4>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <%= Html.EditorFor(m => m.Name, new { required = true })%>
        <%= Html.EditorFor(m => m.State, new { required = true })%>
        <%= Html.EditorFor(m => m.County, new { required = true })%>
        <%= Html.EditorFor(m => m.OwnershipType, new { required = true })%>
        <%= Html.EditorFor(m => m.Coordinates, new { helpText = "Latitude, Longitude" })%>
        <%= Html.EditorFor(m => m.OwnershipContactInfo, new { rows = 5 })%>
        <%= Html.EditorFor(m => m.MakeOwnershipContactInfoPublic)%>
        <%= Html.EditorFor(m => m.Comments, new { rows = 5 })%>
        <div class="buttonrow">
            <button type="submit" class="btn btn-grey Remove" name="innerAction" value="Subsite.<%= Model.Id %>.Remove">Remove</button>
        </div>
    </div>
</div>
