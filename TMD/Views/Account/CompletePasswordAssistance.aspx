<%@ Page Title="Complete Password Assistance" Language="C#" MasterPageFile="~/Views/Shared/Login.Master"  Inherits="System.Web.Mvc.ViewPage<CompleteAccountPasswordAssistanceModel>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript" src="/js/jquery/jquery-1.4.4.min.js"></script>
    <script type="text/javascript">
        $(function () { $('input[type=text]:first').focus(); });
    </script>
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% if (Model.AssistanceComplete) { %>
        <div class="content_front">
            <div class="pad">
                <h2>Your password has been changed</h2>
                <p>You can now <%= Html.ActionLink("logon", "Logon") %> to your account using your new password.</p>
            </div>
        </div>
    <% } else if (Model.CanCompletePasswordAssistance) { %>
        <% using(Html.BeginForm("CompletePasswordAssistance", "Account", FormMethod.Post, new { id = "login_form", name = "login" })) { %>
            <div class="content_front">
                <div class="pad">
                    <%= Html.EditorFor(m => m.Password, "Password")%>
                    <%= Html.EditorFor(m => m.ConfirmPassword, "Password")%>
			        <div class="field">
			            <span class="label">&nbsp;</span>
			            <div>
                            <button type="submit" class="btn">Change password</button>
                        </div>
			        </div> <!-- .field -->
                </div>
            </div>
        <% } %>
    <% } else { %>
        <div class="content_front">
            <div class="pad">
                <h2>Password assistance request expired</h2>
                <p>You can resubmit your request for <%= Html.ActionLink("password assistance", "PasswordAssistance")%> if you still need help.</p>
            </div>
        </div>
    <% } %>
</asp:Content>
