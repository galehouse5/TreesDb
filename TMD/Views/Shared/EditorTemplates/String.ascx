<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<String>" %>
<div
    <% if (ViewData.ContainsKey("class")) { %>
        class="field <%= ViewData["class"] %>"
    <% } else { %>
        class="field"
    <% } %>
>
    <label for="<%= Html.GetFullHtmlFieldId<string, string>(m => m) %>">
        <% if (ViewData.ContainsKey("label")) { %>
            <%: ViewData["label"] %>
        <% } else { %>
            <%= Html.GetLabelInnerText<string, string>(m => m) %>
        <% } %>
        <% if ((bool)(ViewData["required"] ?? false)) { %>
            <em class="required">*</em>
        <% } %>
    </label>
    <div><span class="input">
        <% if (ViewData.ContainsKey("rows")) { %>
            <% if (ViewData.ContainsKey("id")) { %>
                <%= Html.TextAreaFor(m => m, new { @rows = ViewData["rows"], @cols = ViewData["cols"] ?? 50, @class = "text", id = ViewData["id"] })%>
            <% } else { %>
                <%= Html.TextAreaFor(m => m, new { @rows = ViewData["rows"], @cols = ViewData["cols"] ?? 50, @class = "text" })%>
            <% } %>
        <% } else { %>
            <% if (ViewData.ContainsKey("id")) { %>
                <%= Html.TextBoxFor(m => m, new { @size = ViewData["size"] ?? 50, @class = "text", id = ViewData["id"] })%>
            <% } else { %>
                <%= Html.TextBoxFor(m => m, new { @size = ViewData["size"] ?? 50, @class = "text" })%>
            <% } %>
        <% } %>        
        <%= Html.ValidationMessageFor(m => m)%>
    </span></div>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
