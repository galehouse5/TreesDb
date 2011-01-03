<%@ Page Title="Import Trees" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="ViewPageBase<ImportTreesModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

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
    <% using (Html.BeginForm("Trees", "Import", FormMethod.Post, new { @class = "form stn-form Trees" })) { %>
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
    <script type="text/javascript" src="/js/Import/Trees.js"></script>
    <script type="text/javascript">
        $(function () {
            Import.Init();
            $('body').live('ContentAdded', function () {
                $('.RequiresJavascript').show();
                slate.init();
                slate.portlet.init();
            }).trigger('ContentAdded');
        });
    </script>
    <%= Html.Action("GoogleMapsScript", "Map") %>
    <script type="text/javascript" src="/js/Map/Coordinates.js"></script>
    <script type="text/javascript" src="/js/Map/CoordinatePicker.js"></script>
</asp:Content>
