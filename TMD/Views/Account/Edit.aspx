<%@ Page Title="Account" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<AccountEditModel>" %>

<asp:Content ID="Content3" ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript">
        $(function () { $('input[type=text]:first').focus(); });
    </script>
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="Content" runat="server">
    <div class="portlet x6">
		<div class="portlet-header"><h4>Edit account</h4></div>
		<div class="portlet-content">
            <% using (Html.BeginForm("Edit", "Account", FormMethod.Post, new { @class = "form" })) { %>
                <%= Html.EditorFor(m => m.Email, new { disabled = true })%>
                <%= Html.EditorFor(m => m.Details.Name, new { helpText = "Lastname, Firstname" }) %>
                 <div class="buttonrow">
                    <button type="submit" class="btn">Save</button>
                </div>
            <% } %>
		</div>
	</div>
	<div class="portlet x6">
		<div class="portlet-header"><h4>Change password</h4></div>
		<div class="portlet-content">
            <% using (Html.BeginForm("Edit", "Account", FormMethod.Post, new { @class = "form" })) { %>
                <%= Html.EditorFor(m => m.Password.ExistingPassword, "Password") %>
                <%= Html.EditorFor(m => m.Password.NewPassword, "Password")%>
                <%= Html.EditorFor(m => m.Password.ConfirmPassword, "Password")%>
                 <div class="buttonrow">
                    <button type="submit" class="btn">Change password</button>
                </div>
            <% } %>
		</div>
	</div>
</asp:Content>
