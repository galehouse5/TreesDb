﻿<%@ Page Title="Logon" Language="C#" MasterPageFile="~/Views/Shared/Login.Master"  Inherits="System.Web.Mvc.ViewPage<TMD.Models.AccountLogonModel>" %>

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript" src="/js/jquery/jquery.1.4.2.min.js"></script>
    <script type="text/javascript">
        $(function () {
            $('#login_email').focus();
        });
    </script>
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% using(Html.BeginForm("Logon", "Account", FormMethod.Post, new { id = "login_form", name = "login", @class = "stn-form" })) { %>
        <% if (Model.PerformHumanVerification) { %>
            <div class="content_front">
                <div class="pad">

                    <%= Html.HiddenFor(m => m.Email) %>
                    <%= Html.HiddenFor(m => m.Password) %>
                    <%= Html.HiddenFor(m => m.RememberMe) %>

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

                    <%= Html.EditorFor(m => m.Email, new { id = "login_email" })%>

				    <div class="field">
                        <%= Html.LabelFor(m => m.Password) %>
					    <div><span class="input">
                            <%= Html.PasswordFor(m => m.Password, new { id = "login_password", @class = "text" }) %>
                            <a href="javascript:;" id="forgot_my_password">Forgot password?</a>
                            <%= Html.ValidationMessageFor(m => m.Password, string.Empty, new { style = "margin-top: 34px;" })%>
                        </span></div>
				    </div> <!-- .field -->

                    <%= Html.EditorFor(m => m.RememberMe, new { id = "remember" })%>

				    <div class="field">
					    <span class="label">&nbsp;</span>
					    <div>
                            <button type="submit" class="btn">Logon</button>
                            &nbsp;&nbsp;<a href="javascript:;" id="register_account">Register</a>
                        </div>
				    </div> <!-- .field -->

	            </div>
	        </div>
        <% } %>
    <% } %>
</asp:Content>