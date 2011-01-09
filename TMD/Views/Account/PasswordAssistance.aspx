<%@ Page Title="Password Assistance" Language="C#" MasterPageFile="~/Views/Shared/Login.Master"  Inherits="System.Web.Mvc.ViewPage<AccountPasswordAssistanceModel>" %>

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <%= Html.VersionedScript("/js/jquery/jquery-1.4.4.min.js", new { type = "text/javascript" })%>
    <script type="text/javascript">
        $(function () { $('input[type=text]:first').focus(); });
    </script>
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% if (Model.AssistanceComplete) { %>
        <div class="content_front">
            <div class="pad">
                <h2>Please check your email</h2>
                <p>Instructions for creating a new password were emailed to <strong><%= Model.Email %></strong>.</p>
            </div>
        </div>
    <% } else {%>
        <% using(Html.BeginForm("PasswordAssistance", "Account", FormMethod.Post, new { id = "login_form", name = "login" })) { %>
            <div class="content_front">
                <div class="pad">
                    <% if (Model.PerformHumanVerification) { %>
                        <%= Html.HiddenFor(m => m.Email) %>
                        <%= Html.HiddenFor(m => m.ConfirmEmail)%>
                        <div class="field captcha">
                            <%= Html.LabelFor(m => m.PerformHumanVerification) %>
                            <div><span class="input">
                                <%= Html.GenerateCaptcha("", "blackglass") %>
                            </span></div>
                        </div> <!-- .field -->
                    <% } else { %>
                        <%= Html.EditorFor(m => m.Email)%>
                        <%= Html.EditorFor(m => m.ConfirmEmail) %>
                    <% } %>
                    <div class="field">
			            <span class="label">&nbsp;</span>
			            <div>
                            <button type="submit" class="btn">Continue</button>
                        </div>
		            </div> <!-- .field -->
                </div>
            </div>
        <% } %>
    <% } %>
</asp:Content>
