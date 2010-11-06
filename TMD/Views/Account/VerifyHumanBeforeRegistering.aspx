<%@ Page Title="Register" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.AccountRegistrationModel>" %>
<%@ Assembly Name="Recaptcha" %>
<%@ Import Namespace="Recaptcha" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
    <script type="text/javascript" src="/Scripts/Account.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<div class="EmphasizeContent Centered">
    <div class="InputColumn account-form ui-widget-content ui-corner-all">        
        <h2>Please veryify that you're human</h2>
        <% using(Html.BeginForm()) { %>
            <%= Html.HiddenFor(m => m.Email)  %>
            <%= Html.HiddenFor(m => m.ConfirmEmail)  %>
            <%= Html.HiddenFor(m => m.Firstname)  %>
            <%= Html.HiddenFor(m => m.Lastname)  %>
            <%= Html.HiddenFor(m => m.Password)  %>
            <%= Html.HiddenFor(m => m.ConfirmPassword)  %>
            <%= Html.GenerateCaptcha("", "blackglass") %>
            <div class="InputButtonRow">
                <input type="submit" value="Register" />
                <div class="ui-helper-clearfix"></div>
            </div>
        <% } %>
    </div>
</div>
</asp:Content>
