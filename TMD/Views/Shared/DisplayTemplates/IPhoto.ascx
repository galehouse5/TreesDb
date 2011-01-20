<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<IPhoto>" %>
<%@ Import Namespace="TMD.Model.Photos" %>
<li>
    <% if(ViewData.ContainsKey("size")) { %>
        <img src="<%= Url.Action("View", "Photos", new { id = Model.PhotoId, size = (EPhotoSize)ViewData["size"] }) %>" alt="" />
    <% } else { %>
        <img src="<%= Url.Action("View", "Photos", new { id = Model.PhotoId, size = EPhotoSize.SquareThumbnail }) %>" alt="" />
    <% } %>    
    <div class="actions">	
        <a class="btn btn-orange btn-small" rel="facebox" href="<%= Url.Action("View", "Photos", new { id = Model.PhotoId }) %>">View</a>
    </div>
</li>