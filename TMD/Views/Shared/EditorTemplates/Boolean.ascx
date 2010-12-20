<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Boolean>" %>
<div class="field">
    <label for="<%= Html.GetFullHtmlFieldId<bool, bool>(m => m) %>">
        <% if (ViewData.ContainsKey("label")) { %>
            <%: ViewData["label"] %>
        <% } else { %>
            <%= Html.GetLabelInnerText<bool, bool>(m => m)%>
        <% } %>
        <% if ((bool)(ViewData["required"] ?? false)) { %>
            <em class="required">*</em>
        <% } %>
    </label>
    <div><span class="input">
        <% if (ViewData.ContainsKey("id")) { %>
            <%= Html.CheckBoxFor(m => m, new { @class = "text", id = ViewData["id"] })%>
        <% } else { %>
            <%= Html.CheckBoxFor(m => m, new { @class = "text" })%>
        <% } %>   
        <%= Html.ValidationMessageFor(m => m)%>
    </span></div>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
