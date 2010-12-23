<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<div class="field">
    <label for="<%= Html.GetFullHtmlFieldId<object, object>(m => m) %>">
        <% if (ViewData.ContainsKey("label")) { %>
            <%: ViewData["label"] %>
        <% } else { %>
            <%= Html.GetLabelInnerText<object, object>(m => m)%>
        <% } %>
        <% if ((bool)(ViewData["required"] ?? false)) { %>
            <em class="required">*</em>
        <% } %>
    </label>
    <%= Html.DropDownListFor(m => m,
        Enum.GetNames(Model.GetType()).Select(name => new SelectListItem {
            Text = "NotSpecified".Equals(name) && string.Empty.Equals(((Enum)Enum.Parse(Model.GetType(), name)).Describe()) ?
                "None selected" : ((Enum)Enum.Parse(Model.GetType(), name)).Describe(),
            Value = Convert.ToInt32(Enum.Parse(Model.GetType(), name)).ToString(),
            Selected = Model.Equals(Enum.Parse(Model.GetType(), name))
        })) %>        
    <%= Html.ValidationMessageFor(m => m)%>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
