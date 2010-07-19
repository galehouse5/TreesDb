﻿<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.PasswordAssistanceModel>" %>
<%@ Assembly Name="Recaptcha" %>
<%@ Import Namespace="Recaptcha" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
    <script type="text/javascript" src="/Scripts/Account.js"></script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<div class="ui-content-emphasize ui-centered">
    <div class="ui-form-column account-form ui-widget-content ui-corner-all">
        <h2>Please verify that you're human</h2>
        <% using(Html.BeginForm()) { %>
            <div class="ui-form-row">
                <%= Html.HiddenFor(m => m.Email) %>
                <%= Html.HiddenFor(m => m.ConfirmEmail) %>
                <%= Html.GenerateCaptcha("", "blackglass") %>
            <div class="ui-form-button-row">
                <input type="submit" value="Continue" />
                <div class="ui-helper-clearfix"></div>
            </div>
        <% } %>
    </div>
</div>
</asp:Content>