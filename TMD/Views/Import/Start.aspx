<%@ Page Title="Import Start" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="ViewPageBase<Trip>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="Steps" runat="server">
    <ol>    
        <% if (Model.Id == 0) { %>
            <li><strong>> <%= Html.ActionLink("Start", "Start") %> <</strong></li>
        <% } else { %>
            <li><strong>> <%= Html.ActionLink("Start", "Start", new { id = Model.Id })%> <</strong></li>
        <% } %>
        <li>Enter trip</li>
        <li>Enter sites</li>
        <li>Enter trees</li>
        <li>Finish</li>
    </ol>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepHeader" runat="server">
    <h4>Start</h4>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
    <% if(Model.Id == 0) { %>
        <% Html.BeginForm("Start", "Import", FormMethod.Post, new { @class = "form" }); %>
    <% } else { %>
        <% Html.BeginForm("Trip", "Import", new { id = Model.Id }, FormMethod.Get, new { @class = "form" }); %>
    <% } %>

        <p>Prepare the following information before you start:</p>
        <ul>
            <li>Contact info for the primary measurer on your trip</li>
            <li>Names, counties, states, and ownership info for all visited sites</li>
            <li>Common name, genus, species, and tree form type and number of trunks for all measured trees</li>
            <li>Date of each recorded measurement</li>
            <li>First and last name of all participating measurers</li>
            <li>GPS coordinates either on a site or subsite level or for individual trees</li>
        </ul>
        <div class="buttonrow">
            <button type="submit" class="btn">Continue</button>
        </div>
    <% Html.EndForm(); %>
</asp:Content>

