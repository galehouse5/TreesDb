<%@ Page Title="Import Trees" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="ViewPageBase<ImportTreesModel>" %>
<%@ Import Namespace="TMD.Model.Imports" %>

<asp:Content ContentPlaceHolderID="Steps" runat="server">
    <ol>
        <li><%= Html.ActionLink("Start", "Start") %></li>
        <li><%= Html.ActionLink("Enter trip", "Trip", new { id = Model.Id }) %></li>
        <li><%= Html.ActionLink("Enter sites", "Sites", new { id = Model.Id }) %></li>
        <li><strong>> <%= Html.ActionLink("Enter trees", "Trees", new { id = Model.Id }) %> <</strong></li>
        <li>Finish</li>
    </ol>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepHeader" runat="server">
    <h4>Enter trees</h4>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
    <% using (Html.BeginForm("Trees", "Import", FormMethod.Post, new { @class = "form Trees" })) { %>
        <% for (int i = 0; i < Model.Sites.Count; i++) { %> 
            <%= Html.EditorFor(m => m.Sites[i], "SiteTrees") %>
        <% } %>
        <div class="buttonrow">
            <button type="submit" class="btn" name="innerAction" value="Trip.<%= Model.Id %>.Save">Continue</button>
            <%= Html.ActionLink("Back", "Sites", new { Id = Model.Id }, new { @class = "btn btn-grey" })%>
        </div>
    <% } %>
</asp:Content>

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <%= Html.VersionedScript("/js/Import/Trees.js", new { type = "text/javascript" })%>
    <script type="text/javascript">
        $(function () {
            $('body').InitializeTreesUi();
            if ($('form.Trees .input-validation-error').length > 0) {
                $('form.Trees .input-validation-error:first').focus()
                    .closest('.Tree').each(function () { $(this).SmoothScrollInFocus(); });
            } else {
                $('form.Trees input[type=text]:first').focus()
                    .closest('.Tree').each(function () { $(this).SmoothScrollInFocus(); });
            }
        });
    </script>
    <%= Html.Action("GoogleMapsScript", "Map") %>
    <%= Html.VersionedScript("/js/Map/Coordinates.js", new { type = "text/javascript" })%>
    <%= Html.VersionedScript("/js/Map/CoordinatePicker.js", new { type = "text/javascript" })%>
</asp:Content>
