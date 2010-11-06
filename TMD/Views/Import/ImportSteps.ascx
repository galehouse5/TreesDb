<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportStepModel>" %>
<%@ Import Namespace="TMD.Models" %>
<ul>
    <li>
    <% if (Model.CurrentStep == ImportStep.Start) { %>
        <%= Html.ActionLink("Start >", "Start", null, new { @class = "ui-state-activate ImportRetreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Start)) { %>
        <%= Html.ActionLink("Start >", "Start", null, new { @class = Model.IsStepAnAdvance(ImportStep.Start) ? "ImportAdvance" : "ImportRetreat" })%>
    <% } else { %>
        <%= Html.ActionLink("Start >", "Start", null, new { @class = "ui-state-disable" }) %>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Trip) { %>
        <%= Html.ActionLink("Trip >", "Trip", null, new { @class = "ui-state-activate selected ImportRetreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Trip)) { %>
        <%= Html.ActionLink("Trip >", "Trip", null, new { @class = Model.IsStepAnAdvance(ImportStep.Trip) ? "ImportAdvance" : "ImportRetreat" })%>
    <% } else { %>
        <%= Html.ActionLink("Trip >", "Trip", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.SiteVisits) { %>
        <%= Html.ActionLink("Sites & subsites >", "SiteVisits", null, new { @class = "ui-state-activate ImportRetreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.SiteVisits)) { %>
        <%= Html.ActionLink("Sites & subsites >", "SiteVisits", null, new { @class = Model.IsStepAnAdvance(ImportStep.SiteVisits) ? "ImportAdvance" : "ImportRetreat" })%>
    <% } else { %>
        <%= Html.ActionLink("Sites & subsites >", "SiteVisits", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.TreeMeasurements) { %>
        <%= Html.ActionLink("Measurements >", "TreeMeasurements", null, new { @class = "ui-state-activate ImportRetreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.TreeMeasurements)) { %>
        <%= Html.ActionLink("Measurements >", "TreeMeasurements", null, new { @class = Model.IsStepAnAdvance(ImportStep.TreeMeasurements) ? "ImportAdvance" : "ImportRetreat" })%>
    <% } else { %>
        <%= Html.ActionLink("Measurements >", "TreeMeasurements", null, new { @class = "ui-state-disable" })%>       
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Review) { %>
        <%= Html.ActionLink("Review >", "Review", null, new { @class = "ui-state-activate ImportRetreat" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Review)) { %>
        <%= Html.ActionLink("Review >", "Review", null, new { @class = Model.IsStepAnAdvance(ImportStep.Review) ? "ImportAdvance" : "ImportRetreat" })%>
    <% } else { %>
        <%= Html.ActionLink("Review >", "Review", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Finish) { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = "ui-state-activate ImportRetreat" })%>
    <% } else { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
</ul>