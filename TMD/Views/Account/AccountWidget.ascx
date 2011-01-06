<%@ Control Language="C#" Inherits="ViewUserControlBase<AccountWidgetModel>" %>
<div id="info">
    <p>
        <% if (!Model.IsLoggedOn) { %>
            <% if (!string.IsNullOrWhiteSpace(TempData.AccountMessage)) { %>
                <%= TempData.AccountMessage %>
            <% } else { %>
                You are not logged on.
            <% } %>
            <br />
            <%= Html.ActionLink("Logon", "Logon", "Account") %> or <%= Html.ActionLink("Register", "Register", "Account")%>.
        <% } else { %>
            <% if (!string.IsNullOrWhiteSpace(TempData.AccountMessage)) { %>
                <%= TempData.AccountMessage %>
            <% } else { %>
                Welcome <%: Model.Email %>.
            <% } %>
            <br />
            <%= Html.ActionLink("Edit account", "Edit", "Account") %> or <%= Html.ActionLink("Logout", "Logout", "Account") %>.
        <% } %>
    </p>
</div> <!-- #info -->