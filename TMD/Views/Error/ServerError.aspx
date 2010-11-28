<%@ Page Title="Server Error" Language="C#" MasterPageFile="~/Views/Shared/Login.Master" Inherits="System.Web.Mvc.ViewPage" %>
<%@ Import Namespace="TMD" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="content_front">
        <div class="pad">
            <h2>This page has an error</h2>
            <p>
                Sorry, the server encountered an error while loading this page.
                Please try again or email <a href="mailto:<%= WebApplicationRegistry.Settings.WebmasterEmail %>"><%= WebApplicationRegistry.Settings.WebmasterEmail %></a> if the problem persists.
                <a href="/">Click here</a> to get back to the homepage.
            </p>
        </div>
    </div>
</asp:Content>
