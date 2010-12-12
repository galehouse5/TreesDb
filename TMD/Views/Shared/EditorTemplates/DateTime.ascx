<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Nullable<DateTime>>" %>
<div class="field">
    <label for="<%= Html.GetFullHtmlFieldId<Nullable<DateTime>, Nullable<DateTime>>(m => m) %>">
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>
    <% } else { %>
        <%= Html.GetLabelInnerText<Nullable<DateTime>, Nullable<DateTime>>(m => m)%>
    <% } %>
    <% if ((bool)(ViewData["required"] ?? false)) { %>
        <em class="required">*</em>
    <% } %>
    </label>
    <div><span class="input">
        <% if (ViewData.ContainsKey("id")) { %>
            <%= Html.TextBox(string.Empty,
                Model.HasValue ? Model.Value.ToShortDateString() : string.Empty,
                new { @size = ViewData["size"] ?? 40, @class = "text datepicker", id = ViewData["id"] }) %>
        <% } else { %>
            <%= Html.TextBox(string.Empty,
                Model.HasValue ? Model.Value.ToShortDateString() : string.Empty,
                new { @size = ViewData["size"] ?? 40, @class = "text datepicker" }) %>
        <% } %>  
        <%= Html.ValidationMessageFor(m => m)%>
    </span></div>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
