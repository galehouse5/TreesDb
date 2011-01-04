<%@ Page Title="Import Finish" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="ViewPageBase<ImportFinishedTripModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="Steps" runat="server">
    <ol>
        <li><%= Html.ActionLink("Start", "Start") %></li>
        <li><%= Html.ActionLink("Enter trip", "Trip", new { id = Model.Id }) %></li>
        <li><%= Html.ActionLink("Enter sites", "Sites", new { id = Model.Id }) %></li>
        <li><%= Html.ActionLink("Enter trees", "Trees", new { id = Model.Id }) %></li>
        <li><strong>> <%= Html.ActionLink("Finish", "Finish", new { id = Model.Id }) %> <</strong></li>
    </ol>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="StepHeader" runat="server">
    <h4>Finish</h4>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
    <% using (Html.BeginForm("Finish", "Import", FormMethod.Post, new { @class = "form" })) { %>
        <%= Html.DisplayFor(m => m, "FinishedTrip") %>
        <div class="buttonrow">
            <button type="submit" class="btn">Finish</button>
            <%= Html.ActionLink("Back", "Trees", new { Id = Model.Id }, new { @class = "btn btn-grey" })%>
        </div>
    <% } %>
</asp:Content>
