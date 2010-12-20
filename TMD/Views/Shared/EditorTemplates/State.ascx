<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<State>" %>
<%@ Import Namespace="TMD.Model.Locations" %>
<div class="field">
    <label for="<%= Html.GetFullHtmlFieldId<State, State>(m => m) %>">
        <% if (ViewData.ContainsKey("label")) { %>
            <%: ViewData["label"] %>
        <% } else { %>
            <%= Html.GetLabelInnerText<State, State>(m => m)%>
        <% } %>
        <% if ((bool)(ViewData["required"] ?? false)) { %>
            <em class="required">*</em>
        <% } %>
    </label>
    <%= Html.DropDownListFor(m => m, 
        Repositories.Locations.FindAllStates()
            .Select(s => new SelectListItem { Text = string.Format("{0}, {1}", s.Name, s.Country.Name), Value = s.Id.ToString(), Selected = Model == s})
            .Union(new List<SelectListItem> { new SelectListItem { Text = "No state selected", Value = 0.ToString(), Selected = Model == null } })) %>        
    <%= Html.ValidationMessageFor(m => m)%>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
