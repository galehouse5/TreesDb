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
        <% Html.BeginForm("New", "Import", FormMethod.Post, new { @class = "form" }); %>
    <% } else { %>
        <% Html.BeginForm("Trip", "Import", new { id = Model.Id }, FormMethod.Get, new { @class = "form" }); %>
    <% } %>
        <%= Html.Partial("StartPartial")%>
        <div class="buttonrow">
            <button type="submit" class="btn">Continue</button>
        </div>
    <% Html.EndForm(); %>
</asp:Content>

