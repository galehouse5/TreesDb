<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>
<%@ Import Namespace="TMD" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
<div class="EmphasizeContent Centered">
    <div class="InputColumn account-form ui-widget-content ui-corner-all">        
        <h2>Unauthorized</h2>
        <p>
            Sorry, you aren't authorized to use this feature.  
            Please contact an administrator or email 
            <a href="mailto:<%= WebApplicationRegistry.Settings.WebmasterEmail %>">
                <%= WebApplicationRegistry.Settings.WebmasterEmail %>.
            </a>
        </p>
    </div>
</div>
</asp:Content>