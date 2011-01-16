<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<PhotoGalleryModel>" %>
<div class="field RequiresJavascript">
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
    <ul class="gallery">
        <% if (Model.HasPhotos) { %>
            <% foreach(var photo in Model.Photos) { %>
                <li>
                    <img src="<%= Url.Action("View", "Photos", new { id = photo.GlobalId, size = photo.Size }) %>" alt="" />
                    <div class="actions">	
                        <%= Html.ActionLink("View", "View", new { controller = "Photos", id = photo.GlobalId }, new { @class = "btn btn-orange btn-small", rel = "facebox" })%>
                        <%= Html.ActionLink("Remove", "Remove", new { controller = "Photos", id = photo.Id, }, new { @class = "btn btn-grey btn-small delete" })%>
                    </div>
                </li>
            <% } %>
        <% } %>
        <% if (Model.HasAdder) { %>
            <li>
                <%= Html.VersionedImage("/images/loading.gif", new { alt = "", style = "display: none; margin: 34px;", @class = "LoadingPhoto" })%>
                <div class="actions ReadyToLoadPhoto" style="display: block;">
                    <div style="height: 30px">
                        <%= (Html.ValidationMessageFor(m => m.Adder) ?? MvcHtmlString.Empty).ToString().Replace(">", " style='margin: 0;'>") %>
                    </div>
                    <%= Html.ActionLink("Add", Model.Adder.ActionName, Model.Adder.RouteValues, new { @class = "btn btn-orange btn-small add", style = "margin: 5px;" })%>
                </div>
            </li>
        <% } %>
    </ul>
</div> <!-- .field -->