<%@ Control Language="C#" Inherits="ViewUserControlBase<AccountWidgetModel>" %>
<div id="info">
    <p>
        <% if (!Model.IsLoggedOn) { %>
                You are not logged on.
                <br />
                <%= Html.ActionLink("Logon", "Logon", "Account") %> or <%= Html.ActionLink("Register", "Register", "Account")%>.
        
        <% } else { %>
                Welcome <%: Model.Email %>.
                <br />
                <%= Html.ActionLink("Edit account", "Edit", "Account") %> or <%= Html.ActionLink("Logout", "Logout", "Account") %>.
        <% } %>
        <% if (!string.IsNullOrWhiteSpace(TempData.AccountMessage)) { %>
            <br />
            <%= TempData.AccountMessage %>
        <% } %>
    </p>
</div> <!-- #info -->