<%@ Page Title="Import Start" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="portlet x2">
        <div class="portlet-header">
            <h4>Steps</h4>
        </div>
        <div class="portlet-content">
            <ol>

                <li><strong>> <%= Html.ActionLink("Start", "Start") %> <</strong></li>
                <li>Enter trip</li>
                <li>Enter sites</li>
                <li>Enter trees</li>
                <li>Finish</li>
            </ol>
        </div>
    </div>
    <div class="portlet x10">
        <div class="portlet-header">
            <h4>Start</h4>
        </div>
        <div class="portlet-content">
            <% using (Html.BeginForm("Start", "Account", FormMethod.Post, new { @class = "form" })) { %>
                <p>Prepare the following information before you start:</p>
                <ul>
                    <li>Contact info for the primary measurer on your trip</li>
                    <li>Names, counties, states, and ownership info for all visited sites</li>
                    <li>Common name, genus, species, and tree form type and number of trunks for all measured trees</li>
                    <li>Date of each recorded measurement</li>
                    <li>First and last name of all participating measurers</li>
                    <li>GPS coordinates either on a site or subsite level or for individual trees</li>
                </ul>
                <div class="buttonrow but">
                    <button type="submit" class="btn">Continue</button>
                </div>
            <% } %>
        </div>
    </div>
</asp:Content>


