<%@ Page Title="Import Sites" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="ViewPageBase<ImportSitesModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="Steps" runat="server">
    <ol>
        <li><%= Html.ActionLink("Start", "Start") %></li>
        <li><%= Html.ActionLink("Enter trip", "Trip", new { id = Model.Id }) %></li>
        <li><strong>> <%= Html.ActionLink("Enter sites", "Sites", new { id = Model.Id }) %> <</strong></li>
        <li>Enter trees</li>
        <li>Finish</li>
    </ol>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepHeader" runat="server">
    <h4>Enter sites</h4>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
    <% using (Html.BeginForm("Sites", "Import", FormMethod.Post, new { @class = "form Sites" })) { %>
        <% for (int i = 0; i < Model.Sites.Count; i++) { %>
            <% if (Model.Sites[i].IsEditing) { %>
                <%= Html.EditorFor(m => m.Sites[i], "Site") %>
            <% } else { %>
                <%= Html.DisplayFor(m => m.Sites[i], "Site") %>
            <% } %>
        <% } %>
        <div class="buttonrow">
            <button type="submit" class="btn" name="innerAction" value="Trip.<%= Model.Id %>.Save">Continue</button>
            <%= Html.ActionLink("Back", "Trip", new { Id = Model.Id }, new { @class = "btn btn-grey" })%>
            <button type="submit" class="btn btn-orange" name="innerAction" value="Trip.<%= Model.Id %>.Add">Add site</button>
        </div>
    <% } %>
</asp:Content>

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript" src="/js/Import/Sites.js"></script>
    <script type="text/javascript">
        $(function () {
            $('body').InitializeSitesUi();
            Import.Init();
        });
    </script>
    <%= Html.Action("GoogleMapsScript", "Map") %>
    <script type="text/javascript" src="/js/Map/Coordinates.js"></script>
    <script type="text/javascript" src="/js/Map/CoordinatePicker.js"></script>
</asp:Content>
