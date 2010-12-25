<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<PhotoGalleryModel>" %>
<ul class="gallery">
    <% foreach(var photo in Model.Photos) { %>
        <li>
            <img src="/Photos/<%= photo.Id %>/SquareThumbnail" alt="" />
            <div class="actions">	
                <a class="btn btn-orange btn-small" rel="facebox" href="/Photos/<%= photo.Id %>">View</a>
            </div>
        </li>
    <% } %>
</ul>