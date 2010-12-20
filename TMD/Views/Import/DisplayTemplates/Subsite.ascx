<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSubsiteModel>" %>
<div class="portlet x12">        
    <div class="portlet-header entity-header subsite-header">
        <h4><%: Model.Name %></h4>
    </div>
    <div class="portlet-content">
        <ul>
            <li><%= Html.DisplayFor(m => m.State) %></li>
            <li><%= Html.DisplayFor(m => m.County) %></li>
            <li><%= Html.DisplayFor(m => m.OwnershipType) %></li>
        </ul>
    </div>
</div>
