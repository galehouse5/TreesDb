<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Models" %>
<b>Import Steps</b>
<ul>
    <li>
    <% if (Model.CurrentStep == EImportStep.Start) { %>
        <%= Html.ActionLink("Start", "Start", null, new { @class = "selected retreat" }) %>
    <% } else if (Model.CanAdvanceToStep(EImportStep.Start)) { %>
        <%= Html.ActionLink("Start", "Start", null, new { @class = Model.IsStepAnAdvance(EImportStep.Start) ? "advance" : "retreat" })%>
    <% } else { %>
        Start
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == EImportStep.TripInfo) { %>
        <%= Html.ActionLink("Trip info", "TripInfo", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(EImportStep.TripInfo)) { %>
        <%= Html.ActionLink("Trip info", "TripInfo", null, new { @class = Model.IsStepAnAdvance(EImportStep.TripInfo) ? "advance" : "retreat" })%>
    <% } else { %>
        Trip info
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == EImportStep.SiteInfo) { %>
        <%= Html.ActionLink("Site info", "SiteInfo", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(EImportStep.SiteInfo)) { %>
        <%= Html.ActionLink("Site info", "SiteInfo", null, new { @class = Model.IsStepAnAdvance(EImportStep.SiteInfo) ? "advance" : "retreat" })%>
    <% } else { %>
        Site info
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == EImportStep.Measurements) { %>
        <%= Html.ActionLink("Measurements", "Measurements", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(EImportStep.Measurements)) { %>
        <%= Html.ActionLink("Measurements", "Measurements", null, new { @class = Model.IsStepAnAdvance(EImportStep.Measurements) ? "advance" : "retreat" })%>
    <% } else { %>
        Measurements        
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == EImportStep.Review) { %>
        <%= Html.ActionLink("Review", "Review", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(EImportStep.Review)) { %>
        <%= Html.ActionLink("Review", "Review", null, new { @class = Model.IsStepAnAdvance(EImportStep.Review) ? "advance" : "retreat" })%>
    <% } else { %>
        Review
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == EImportStep.Finish) { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = "selected retreat" })%>
    <% } else if (Model.CanAdvanceToStep(EImportStep.Finish)) { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = Model.IsStepAnAdvance(EImportStep.Finish) ? "advance" : "retreat" })%>
    <% } else { %>
        Finish
    <% } %>
    </li>
</ul>