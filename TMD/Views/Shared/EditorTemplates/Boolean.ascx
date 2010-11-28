<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Boolean>" %>
<div class="checkbox">
    <span class="label">&nbsp;</span>
    <div>
        <% if (ViewData.ContainsKey("id")) { %>
            <%= Html.CheckBoxFor(m => m, new { @class = "checkbox", id = ViewData["id"] })%>
        <% } else { %>
            <%= Html.CheckBoxFor(m => m, new { @class = "checkbox" }) %>
        <% } %>
        &nbsp;&nbsp;<%= MvcHtmlString.Create(Html.LabelFor(m => m).ToString().Replace("<label", "<label style='display: inline;'")) %>
    </div>
</div> <!-- .field -->
