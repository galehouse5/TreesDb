<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<CoordinatePickerModel>" %>
<div
    <% if (ViewData.ContainsKey("class")) { %>
        class="field CoordinatePicker <%= ViewData["class"] %>"
    <% } else { %>
        class="field CoordinatePicker"
    <% } %>
>
    <label for="<%= Html.GetFullHtmlFieldId(m => m) %>">
        <% if (ViewData.ContainsKey("label")) { %>
            <%: ViewData["label"] %>
        <% } else { %>
            <%= Html.GetLabelInnerText(m => m)%>
        <% } %>
        <% if ((bool)(ViewData["required"] ?? false)) { %>
            <em class="required">*</em>
        <% } %>
    </label>
    <div><span class="input">
        <% if (ViewData.ContainsKey("id")) { %>
            <%= Html.TextBoxFor(m => m.Coordinates, new { @size = ViewData["size"] ?? 40, @class = "text", id = ViewData["id"] })%>
        <% } else { %>
            <%= Html.TextBoxFor(m => m.Coordinates, new { @size = ViewData["size"] ?? 40, @class = "text" })%>
        <% } %>
        <button type="button" style="display: none;" onclick="$(this).trigger('PickCoordinates', [ '<%= Url.Action(Model.MapLoader.ActionName, Model.MapLoader.RouteValues) %>' ]);">
            <%= Html.VersionedImage("/images/icons/Map.png", new { alt = "" }) %>
        </button>
        <%= Html.ValidationMessageFor(m => m)%>
    </span></div>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
