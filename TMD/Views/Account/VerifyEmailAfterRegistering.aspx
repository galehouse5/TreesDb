<%@ Page Title="Tree Measurement Database - Register" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.AccountRegistrationModel>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<div class="ui-content-emphasize ui-centered">
    <div class="InputColumn account-form ui-widget-content ui-corner-all">        
        <h2>Please verify your email</h2>
        <p>An email has been sent to <strong><%= Model.Email %></strong> with a link to verify your email and complete your account registration.</p>
    </div>
</div>
</asp:Content>