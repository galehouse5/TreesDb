<%@ Page Title="Tree Measurement Database - Register" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.AccountRegistrationModel>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
    <script type="text/javascript" src="/Scripts/Account.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<div class="ui-content-emphasize ui-centered">
    <div class="ui-form-column account-form ui-widget-content ui-corner-all">
        <h2>Register a new account</h2>
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
                <%= Html.LabelFor(m => m.ConfirmEmail)%>
                <%= Html.TextBoxFor(m => m.ConfirmEmail)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.ConfirmEmail, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.ConfirmEmail, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Firstname)%>
                <%= Html.TextBoxFor(m => m.Firstname)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Firstname, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Firstname, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.Lastname)%>
                <%= Html.TextBoxFor(m => m.Lastname)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Lastname, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Lastname, "", new { @class = "ui-validation-error-message" })%>
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
             <div class="ui-form-row">
                <%= Html.LabelFor(m => m.ConfirmPassword)%>
                <%= Html.PasswordFor(m => m.ConfirmPassword)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.ConfirmPassword, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.ConfirmPassword, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-button-row">
                <input type="submit" value="Register" />
                <div class="ui-helper-clearfix"></div>
            </div>
        <% } %>
    </div>
</div>
</asp:Content>