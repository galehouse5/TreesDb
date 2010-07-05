<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Models" %>
<b>Import Steps</b>
<ul>
    <li>
    <% if (Model.CurrentStep == ImportStep.Start) { %>
        <%= Html.ActionLink("Start", "Start", null, new { @class = "selected retreat" }) %>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Start)) { %>
        <%= Html.ActionLink("Start", "Start", null, new { @class = Model.IsStepAnAdvance(ImportStep.Start) ? "advance" : "retreat" })%>
    <% } else { %>
        Start
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Trip) { %>
        <%= Html.ActionLink("Trip", "Trip", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Trip)) { %>
        <%= Html.ActionLink("Trip", "Trip", null, new { @class = Model.IsStepAnAdvance(ImportStep.Trip) ? "advance" : "retreat" })%>
    <% } else { %>
        Trip info
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Sites) { %>
        <%= Html.ActionLink("Site visits", "SiteVisits", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Sites)) { %>
        <%= Html.ActionLink("Site visits", "SiteVisits", null, new { @class = Model.IsStepAnAdvance(ImportStep.Sites) ? "advance" : "retreat" })%>
    <% } else { %>
        Site info
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Measurements) { %>
        <%= Html.ActionLink("Measurements", "TreeMeasurements", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Measurements)) { %>
        <%= Html.ActionLink("Measurements", "TreeMeasurements", null, new { @class = Model.IsStepAnAdvance(ImportStep.Measurements) ? "advance" : "retreat" })%>
    <% } else { %>
        Measurements        
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Review) { %>
        <%= Html.ActionLink("Review", "Review", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Review)) { %>
        <%= Html.ActionLink("Review", "Review", null, new { @class = Model.IsStepAnAdvance(ImportStep.Review) ? "advance" : "retreat" })%>
    <% } else { %>
        Review
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Finish) { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Finish)) { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = Model.IsStepAnAdvance(ImportStep.Finish) ? "advance" : "retreat" })%>
    <% } else { %>
        Finish
    <% } %>
    </li>
</ul>