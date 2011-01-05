<%@ Page Title="Verify Email" Language="C#" MasterPageFile="~/Views/Shared/Login.Master"  Inherits="System.Web.Mvc.ViewPage<bool>" %>

<asp:Content ID="Content4" ContentPlaceHolderID="Content" runat="server">
    <div class="content_front">
        <div class="pad">
    <% if (Model) { %>
        <h2>Account registration complete</h2>
        <p>You can now <%= Html.ActionLink("logon", "Logon") %> and start using your account.</p>
    <% } else { %>
        <h2>Email already verified</h2>
        <p>If you've already verified your email you can now <%= Html.ActionLink("logon", "Logon") %>.  If you haven't, you should try <%= Html.ActionLink("re-registering", "Register")%>.</p>
    <% } %>
        </div>
    </div>
</asp:Content>