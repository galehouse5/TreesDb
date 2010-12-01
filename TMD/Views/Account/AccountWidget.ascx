<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<AccountWidgetModel>" %>
<div id="info">
    <% if (!Model.IsLoggedOn) { %>
        <p>
            You are not logged on.
            <br />
            <%= Html.ActionLink("Logon", "Logon", "Account") %> or <%= Html.ActionLink("Register", "Register", "Account")%>.
        </p>
    <% } else { %>
        <p>
            Welcome <%: Model.Email %>.
            <br />
            <%= Html.ActionLink("Edit account", "Edit", "Account") %> or <%= Html.ActionLink("Logout", "Logout", "Account") %>.
        </p>
    <% } %>
</div> <!-- #info -->