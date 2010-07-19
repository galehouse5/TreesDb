<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.PasswordAssistanceModel>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
    <script type="text/javascript" src="/Scripts/Account.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<div class="ui-content-emphasize ui-centered">
    <div class="ui-form-column account-form ui-widget-content ui-corner-all">        
        <h2>Create a new password</h2>
        <% using(Html.BeginForm()) { %>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.NewPassword)%>
                <%= Html.PasswordFor(m => m.NewPassword)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.NewPassword, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.NewPassword, "", new { @class = "ui-validation-error-message" })%>
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
                <input type="submit" value="Change password" />
                <div class="ui-helper-clearfix"></div>
            </div>
        <% } %>
    </div>
</div>
</asp:Content>
