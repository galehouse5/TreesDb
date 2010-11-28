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
            Welcome <%= MvcHtmlString.Create(Model.Email) %>.
            <br />
            <%= Html.ActionLink("Edit account", "Edit", "Account") %> or <%= Html.ActionLink("Logout", "Logout", "Account") %>.
        </p>
    <% } %>

    <%--<h4>Welcome James</h4>
				
				<p>

					Logged in as Admin
					<br />
					You have <a href="javascript:;">5 messages</a>
				</p>
				
				<img src="./images/avatar.jpg" alt="avatar" />--%>
</div> <!-- #info -->


<%--<div class="ui-account ui-script-show">
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
--%>