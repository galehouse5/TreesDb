<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<AccountWidgetModel>" %>
<div class="ui-account ui-script-show">
    <% if (Model.IsLoggedOn) { %>
        <div>
            <%= Html.ActionLink("Account", "Edit", "Account", null, new { @class = "ui-account-edit" })%>
            <% using (Html.BeginForm("LogOut", "Account")) { %>
                <button type="submit" class="ui-account-logout">Logout</button>
            <% } %>
        </div>
        <div class="ui-account-info">
            <span class="ui-state-active ui-corner-all">
                <%= Model.Email %>
            </span>
        </div>
    <% } else { %>
        <%= Html.ActionLink("Logon", "Logon", "Account", null, new { @class = "ui-account-logon" })%>
    <% } %>
</div>
