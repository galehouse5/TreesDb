<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<String>" %>
<div class="field">
    <%= Html.LabelFor(m => m)%>
    <div><span class="input">
        <% if (ViewData.ContainsKey("id")) { %>
            <%= Html.TextBoxFor(m => m, new { @class = "text", id = ViewData["id"] })%>
        <% } else { %>
            <%= Html.TextBoxFor(m => m, new { @class = "text" })%>
        <% } %>
        <%= Html.ValidationMessageFor(m => m)%>
    </span></div>
</div> <!-- .field -->
