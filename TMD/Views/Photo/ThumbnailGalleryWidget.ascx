<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<IList<PhotoEditModel>>" %>
<ul class="gallery">
    <% foreach(var photo in Model) { %>
       <li><% Html.RenderAction("ThumbnailWidget", "Photo", new { model = photo }); %></li>
    <% } %>
</ul>