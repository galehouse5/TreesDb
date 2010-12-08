<%@ Page Title="Import Trip" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="ViewPageBase<ImportEditTripModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="portlet x2">
        <div class="portlet-header">
            <h4>Steps</h4>
        </div>
        <div class="portlet-content">
            <ol>
                <li><%= Html.ActionLink("Start", "Start") %></li>
                <li><strong>> <%= Html.ActionLink("Enter trip", "Trip", new { id = Model.Id }) %> <</strong></li>
                <li>Enter sites</li>
                <li>Enter trees</li>
                <li>Finish</li>
            </ol>
        </div>
    </div>
    <div class="portlet x10">
        <div class="portlet-header">
            <h4>Enter trip</h4>
        </div>
        <div class="portlet-content">
            <% using (Html.BeginForm("Trip", "Import", FormMethod.Post, new { @class = "form" })) { %>
                <%= Html.EditorFor(m => m.Name, new { label = "Trip name", required = true }) %>
                

                <%= Html.EditorFor(m => m.Measurers[0].FirstName) %>
                <%= Html.EditorFor(m => m.Measurers[0].LastName) %>


                <%= Html.EditorFor(m => m.MeasurerContactInfo, new { label = "Measurer contact", required = true, rows = 5 })%>
                



                <%--<%= Html.EditorFor(m => m.Date, new { label = "Trip date", required = true }) %>--%>

                <%= Html.EditorFor(m => m.Website)%>



                


                <div class="buttonrow">
                    <button type="submit" class="btn">Continue</button>
                    <%= Html.ActionLink("Back", "Start", new { Id = Model.Id }, new { @class = "btn btn-orange" }) %>
                </div>
            <% } %>
        </div>
    </div>
</asp:Content>


<%--<%@ Page Title="Import Trip" Language="C#" MasterPageFile="~/Views/Import/Import.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportStepModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<script type="text/javascript" src="/Scripts/Import/Trip.js"></script>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h2>Enter general information about your trip</h2>
<% Html.RenderAction("Edit", "Trip");  %>
</asp:Content>

<asp:Content ContentPlaceHolderID="LeftNavigationContent" runat="server">
<%= Html.ActionLink("Back", "Start", null, new { @class = "ImportRetreat" })%>
</asp:Content>

<asp:Content ContentPlaceHolderID="RightNavigationContent" runat="server">
<%= Html.ActionLink("Next", "SiteVisits", null, new { @class = "ImportAdvance" })%>
</asp:Content>
--%>