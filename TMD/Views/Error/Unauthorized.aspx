<%@ Page Title="Unauthorized" Language="C#" MasterPageFile="~/Views/Shared/Login.Master" Inherits="System.Web.Mvc.ViewPage" %>
<%@ Import Namespace="TMD" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="content_front">
        <div class="pad">
            <h2>This page requires authorization</h2>
            <p>
                Sorry, you aren't authorized to view this page.
                Please contact an administrator or email <a href="mailto:<%= WebApplicationRegistry.Settings.WebmasterEmail %>"><%= WebApplicationRegistry.Settings.WebmasterEmail %></a> to request access.
                <a href="/">Click here</a> to get back to the homepage.
            </p>
        </div>
    </div>
</asp:Content>