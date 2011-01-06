<%@ Page Title="Register" Language="C#" MasterPageFile="~/Views/Shared/Login.Master"  Inherits="System.Web.Mvc.ViewPage<AccountRegistrationModel>" %>

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript" src="/js/jquery/jquery-1.4.4.min.js"></script>
    <script type="text/javascript">
        $(function () { $('input[type=text]:first').focus(); });
    </script>
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% if (Model.RegistrationComplete) { %>
        <div class="content_front">
            <div class="pad">
                <h2>Please verify your email</h2>
                <p>An email was sent to <strong><%= Model.Email %></strong> with a link to complete your registration.</p>
            </div>
        </div>
    <% } else { %>
        <% using(Html.BeginForm("Register", "Account", FormMethod.Post, new { id = "login_form", name = "login" })) { %>
            <div class="content_front">
                <div class="pad">
                    <% if (Model.PerformHumanVerification) { %>
                        <%= Html.HiddenFor(m => m.Email)%>
                        <%= Html.HiddenFor(m => m.ConfirmEmail) %>
                        <%= Html.HiddenFor(m => m.Password) %>
                        <%= Html.HiddenFor(m => m.ConfirmPassword) %>
                        <div class="field captcha">
                            <%= Html.LabelFor(m => m.PerformHumanVerification) %>
                            <div><span class="input">
                                <%= Html.GenerateCaptcha("", "blackglass") %>
                            </span></div>
                        </div> <!-- .field -->
                        <div class="field">
			                <span class="label">&nbsp;</span>
			                <div>
                                <button type="submit" class="btn">Continue</button>
                            </div>
		                </div> <!-- .field -->
                    <% } else { %>
                        <%= Html.EditorFor(m => m.Email) %>
                        <%= Html.EditorFor(m => m.ConfirmEmail) %>
                        <%= Html.EditorFor(m => m.Password, "Password")%>
                        <%= Html.EditorFor(m => m.ConfirmPassword, "Password")%>
			            <div class="field">
			                <span class="label">&nbsp;</span>
			                <div>
                                <button type="submit" class="btn">Register</button>
                                &nbsp;&nbsp;
                                <%= Html.ActionLink("Already have an account?", "Logon") %>
                            </div>
			            </div> <!-- .field -->
                    <% } %>
                </div>
            </div>
        <% } %>
    <% } %>
</asp:Content>