﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Coordinates>" %>
<div class="field">
    <label for="<%= Html.GetFullHtmlFieldId<Coordinates, Coordinates>(m => m) %>">
        <% if (ViewData.ContainsKey("label")) { %>
            <%: ViewData["label"] %>
        <% } else { %>
            <%= Html.GetLabelInnerText<Coordinates, Coordinates>(m => m)%>
        <% } %>
        <% if ((bool)(ViewData["required"] ?? false)) { %>
            <em class="required">*</em>
        <% } %>
    </label>
    <div><span class="input">
        <% if (ViewData.ContainsKey("id")) { %>
            <%= Html.TextBoxFor(m => m, new { @size = ViewData["size"] ?? 50, @class = "text", id = ViewData["id"] })%>
        <% } else { %>
            <%= Html.TextBoxFor(m => m, new { @size = ViewData["size"] ?? 50, @class = "text" })%>
        <% } %>    
        <%= Html.ValidationMessageFor(m => m)%>
    </span></div>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->