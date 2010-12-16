<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<PhotoEditModel>" %>
<img src="/Photos/<%= Model.Id %>/SquareThumbnail" alt="" />
<div class="actions">	
    <% if (Model.CanView) { %>
	    <a class="btn btn-orange btn-small" rel="facebox" href="/Photos/<%= Model.Id %>">View</a>
    <% } %>
    <% if (Model.CanRemove) { %>
	    <a class="btn btn-grey btn-small delete" href="/Photos/<%= Model.Id %>/Remove">Remove</a>
    <% } %>
</div>
