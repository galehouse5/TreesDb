<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<PhotoGalleryModel>" %>
<div class="field RequiresJavascript PhotoGallery">
    <label>
        <% if (ViewData.ContainsKey("label")) { %>
            <%: ViewData["label"] %>
        <% } else { %>
            <%= Html.GetLabelInnerText(m => m)%>
        <% } %>
        <% if ((bool)(ViewData["required"] ?? false)) { %>
            <em class="required">*</em>
        <% } %>
    </label>
    <%= Html.ValidationMessageFor(m => m)%>
    <ul class="gallery">
        <% if (Model.HasPhotos) { %>
            <% foreach(var photo in Model.Photos) { %>
                <li>
                    <img src="/Photos/<%= photo.Id %>/<%= photo.Size %>" alt="" />
                    <div class="actions">	
                        <%= Html.ActionLink("View", "View", new { controller = "Photo", id = photo.Id }, new { @class = "btn btn-orange btn-small", rel = "facebox" })%>
                        <%= Html.ActionLink("Remove", "Remove", new { controller = "Photo", id = photo.Id }, new { @class = "btn btn-grey btn-small delete" })%>
                    </div>
                </li>
            <% } %>
        <% } %>
        <% if (Model.HasAdder) { %>
            <li style="border-color: #888;">
                <div class="actions" style="display: block;">
                    <%= Html.ActionLink("Add", Model.Adder.ActionName, Model.Adder.RouteValues, new { @class = "btn btn-orange btn-small add" })%>
                </div>
            </li>
        <% } %>
    </ul>
</div> <!-- .field -->