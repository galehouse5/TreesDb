<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<PhotoGalleryModel>" %>
<ul class="gallery">
    <% foreach(var photo in Model.Photos) { %>
        <li>
            <img src="<%= Url.Action("View", "Photos", new { id = photo.Id, size = photo.Size }) %>" alt="" />
            <div class="actions">	
                <a class="btn btn-orange btn-small" rel="facebox" href="<%= Url.Action("View", "Photos", new { id = photo.Id }) %>">View</a>
            </div>
        </li>
    <% } %>
</ul>