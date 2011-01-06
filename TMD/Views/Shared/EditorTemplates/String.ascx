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
        <%  var htmlAttributes = new Dictionary<string, object>();
            htmlAttributes.Add("class", "text");
            htmlAttributes.Add("size", ViewData["size"] ?? 50);
            if (ViewData.ContainsKey("rows")) 
            {
                htmlAttributes.Add("rows", ViewData["rows"]);
                htmlAttributes.Add("cols", ViewData["cols"] ?? 50);
            }
            if (ViewData.ContainsKey("id")) { htmlAttributes.Add("id", ViewData["id"]); }
            if (ViewData.ContainsKey("disabled")) { htmlAttributes.Add("disabled", ViewData["disabled"]); } %>
        <% if (htmlAttributes.ContainsKey("rows")) { %>
            <%= Html.TextAreaFor(m => m, htmlAttributes) %>
        <% } else { %>
            <%= Html.TextBoxFor(m => m, htmlAttributes) %>
        <% } %>
        <%= Html.ValidationMessageFor(m => m)%>
    </span></div>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
