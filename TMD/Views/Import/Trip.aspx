<%@ Page Title="Import Trip" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="ViewPageBase<ImportTripModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="Steps" runat="server">
    <ol>
        <li><%= Html.ActionLink("Start", "Start") %></li>
        <li><strong>> <%= Html.ActionLink("Enter trip", "Trip", new { id = Model.Id }) %> <</strong></li>
        <li>Enter sites</li>
        <li>Enter trees</li>
        <li>Finish</li>
    </ol>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepHeader" runat="server">
    <h4>Enter trip</h4>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
    <% using (Html.BeginForm("Trip", "Import", FormMethod.Post, new { @class = "form Trip" })) { %>
        <%= Html.EditorFor(m => m.Name, new { required = true }) %>
        <%= Html.EditorFor(m => m.Date, new { required = true }) %>
        <%= Html.EditorFor(m => m.MeasurerContactInfo, new { required = true, rows = 5 })%>
        <%= Html.EditorFor(m => m.MakeMeasurerContactInfoPublic) %>
        <%= Html.EditorFor(m => m.FirstMeasurer, new { required = true, helpText = "Lastname, Firstname" })%>
        <%= Html.EditorFor(m => m.SecondMeasurer, new { helpText = "Lastname, Firstname" })%>
        <%= Html.EditorFor(m => m.ThirdMeasurer, new { helpText = "Lastname, Firstname" })%>
        <div class="buttonrow">
            <button type="submit" class="btn">Continue</button>
            <%= Html.ActionLink("Back", "Start", new { Id = Model.Id }, new { @class = "btn btn-grey" }) %>
        </div>
    <% } %>
</asp:Content>


<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript">
        $(function () {
            if ($('form.Trip .input-validation-error').length > 0) {
                $('form.Trip .input-validation-error:first').focus();
            } else {
                $('form.Trip input[type=text]:first').focus();
            }
        });
    </script>
</asp:Content>

