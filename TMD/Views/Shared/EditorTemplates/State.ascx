<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<State>" %>
<%@ Import Namespace="TMD.Model.Locations" %>
<div
    <% if (ViewData.ContainsKey("class")) { %>
        class="field <%= ViewData["class"] %>"
    <% } else { %>
        class="field"
    <% } %>
>
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
    <%= Html.DropDownListFor(m => m, new List<SelectListItem> { new SelectListItem { 
                Text = "None selected", 
                Value = 0.ToString(), 
                Selected = Model == null
            } }
            .Union(Repositories.Locations.FindAllStates()
            .Select(s => new SelectListItem {
                Text = string.Format("{0}, {1}", s.Name, s.Country.Name), 
                Value = s.Id.ToString(), 
                Selected = s.Equals(Model) 
            }))) %>        
    <%= Html.ValidationMessageFor(m => m)%>
    <% if (ViewData.ContainsKey("helpText")) { %>
        <p class="field_help">
            <%: ViewData["helpText"] %>
        </p>
    <% } %>
</div> <!-- .field -->
