<%@ Page Title="Password Assistance" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<div class="EmphasizeContent Centered">
    <div class="InputColumn account-form ui-widget-content ui-corner-all">        
        <h2>Password assistance request expired</h2>
        <p>
            Your password assistance link has expired.  
            If you still need assistance changing your password, use <%= Html.ActionLink("this link", "PasswordAssistance")%>.
        </p>
    </div>
</div>
</asp:Content>