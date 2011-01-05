<%@ Page Title="Password Assistence" Language="C#" MasterPageFile="~/Views/Shared/Login.Master"  Inherits="System.Web.Mvc.ViewPage<TMD.Models.AccountRegistrationModel>" %>

<%--<asp:Content ID="Content1" ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript" src="/js/jquery/jquery-1.4.4.min.js"></script>
    <script type="text/javascript">
        $(function () { $('#RegistrationEmail').focus(); });
    </script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="Content" runat="server">
    <% if (Model.RegistrationComplete) { %>
        <div class="content_front">
            <div class="pad">
                <h2>Please verify your email</h2>
                <p>An email has been sent to <strong><%= Model.Email %></strong> with a link to verify your email and complete your registration.</p>
            </div>
        </div>
    <% } else { %>
        <% using(Html.BeginForm("Register", "Account", FormMethod.Post, new { id = "login_form", name = "login" })) { %>
            <% if (Model.PerformHumanVerification) { %>
                <div class="content_front">
                    <div class="pad">

                        <%= Html.HiddenFor(m => m.Email) %>
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

	                </div>
	            </div>
            <% } else { %>
                <div class="content_front">
                    <div class="pad">
                        <%= Html.EditorFor(m => m.Email, new { id = "#RegistrationEmail" }) %>
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
	                </div>
	            </div>
            <% } %>
        <% } %>
    <% } %>
</asp:Content>







<%@ Page Title="Password Assistance" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.PasswordAssistanceModel>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
    <link type="text/css" rel="Stylesheet" href="/Styles/Account.css" />
    <script type="text/javascript" src="/Scripts/Account.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<div class="EmphasizeContent Centered">
    <div class="InputColumn account-form ui-widget-content ui-corner-all">
        <h2>Password assistance</h2>
        <% using(Html.BeginForm()) { %>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Email)%>
                <%= Html.TextBoxFor(m => m.Email)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Email, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Email, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.ConfirmEmail)%>
                <%= Html.TextBoxFor(m => m.ConfirmEmail)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.ConfirmEmail, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.ConfirmEmail, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputButtonRow">
                <input type="submit" value="Continue" />
                <div class="ui-helper-clearfix"></div>
            </div>
        <% } %>
    </div>
</div>
</asp:Content>
--%>