<%@ Page Title="Password Assistance" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.PasswordAssistanceModel>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
    <script type="text/javascript" src="/Scripts/Account.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<div class="EmphasizeContent Centered">
    <div class="InputColumn account-form ui-widget-content ui-corner-all">        
        <h2>Create a new password</h2>
        <% using(Html.BeginForm()) { %>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.NewPassword)%>
                <%= Html.PasswordFor(m => m.NewPassword)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.NewPassword, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.NewPassword, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
             <div class="InputRow">
                <%= Html.LabelFor(m => m.ConfirmPassword)%>
                <%= Html.PasswordFor(m => m.ConfirmPassword)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.ConfirmPassword, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.ConfirmPassword, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputButtonRow">
                <input type="submit" value="Change password" />
                <div class="ui-helper-clearfix"></div>
            </div>
        <% } %>
    </div>
</div>
</asp:Content>
