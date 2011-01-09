<%@ Page Title="Logon" Language="C#" MasterPageFile="~/Views/Shared/Login.Master"  Inherits="System.Web.Mvc.ViewPage<TMD.Models.AccountLogonModel>" %>

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <%= Html.VersionedScript("/js/jquery/jquery-1.4.4.min.js", new { type = "text/javascript" })%>
    <script type="text/javascript">
        $(function () { $('input[type=text]:first').focus(); });
    </script>
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% using(Html.BeginForm("Logon", "Account", FormMethod.Post, new { id = "login_form", name = "login" })) { %>
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

                    <%= Html.EditorFor(m => m.Email)%>

				    <div class="field">
                        <%= Html.LabelFor(m => m.Password) %>
					    <div><span class="input">
                            <%= Html.PasswordFor(m => m.Password, new { id = "login_password", @class = "text" }) %>
                            <%= Html.ActionLink("Forgot password?", "PasswordAssistance") %>
                            <%= Html.ValidationMessageFor(m => m.Password, string.Empty, new { style = "margin-top: 34px;" })%>
                        </span></div>
				    </div> <!-- .field -->

                    <div class="checkbox">
					    <span class="label">&nbsp;</span>
					    <div class="">
                            <%= Html.CheckBoxFor(m => m.RememberMe, new { id = "remember" })%>
                            <label for="remember" style="margin-left: 6px; display: inline;">Remember me on this computer</label>
                        </div>
				    </div> <!-- .checkbox -->

				    <div class="field">
					    <span class="label">&nbsp;</span>
					    <div>
                            <button type="submit" class="btn">Logon</button>
                            &nbsp;&nbsp;
                            <%= Html.ActionLink("Need an account?", "Register") %>
                        </div>
				    </div> <!-- .field -->

	            </div>
	        </div>
        <% } %>
    <% } %>
</asp:Content>
