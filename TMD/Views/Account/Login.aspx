<%@ Page Title="Tree Measurement Database - Login" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.AccountLoginModel>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
    <script type="text/javascript" src="/Scripts/Account.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<div class="ui-content-emphasize ui-centered">
    <div class="ui-form-column account-form ui-widget-content ui-corner-all">
        <h2>Login</h2>
        <% using(Html.BeginForm()) { %>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Email)%>
                <%= Html.TextBoxFor(m => m.Email)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Email, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Email, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Password)%>
                <%= Html.PasswordFor(m => m.Password)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Password, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Password, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-button-row">
                <input type="submit" value="Login" />
                <%= Html.ActionLink("Register a new account", "Register", null, new { @class = "button" })%>
                <div class="ui-helper-clearfix"></div>
                <%= Html.ActionLink("Forget your password?", "PasswordAssistance")%>
            </div>
        <% } %>
    </div>
</div>
</asp:Content>
