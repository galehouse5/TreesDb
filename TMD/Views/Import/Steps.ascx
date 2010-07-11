<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Models" %>
<ul>
    <li>
    <% if (Model.CurrentStep == ImportStep.Start) { %>
        <%= Html.ActionLink("Start >", "Start", null, new { @class = "ui-state-activate ui-direction-import-backward" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Start)) { %>
        <%= Html.ActionLink("Start >", "Start", null, new { @class = Model.IsStepAnAdvance(ImportStep.Start) ? "ui-direction-import-forward" : "ui-direction-import-backward" })%>
    <% } else { %>
        <%= Html.ActionLink("Start >", "Start", null, new { @class = "ui-state-disable" }) %>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Trip) { %>
        <%= Html.ActionLink("Trip >", "Trip", null, new { @class = "ui-state-activate selected ui-direction-import-backward" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Trip)) { %>
        <%= Html.ActionLink("Trip >", "Trip", null, new { @class = Model.IsStepAnAdvance(ImportStep.Trip) ? "ui-direction-import-forward" : "ui-direction-import-backward" })%>
    <% } else { %>
        <%= Html.ActionLink("Trip >", "Trip", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Sites) { %>
        <%= Html.ActionLink("Sites & subsites >", "SiteVisits", null, new { @class = "ui-state-activate ui-direction-import-backward" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Sites)) { %>
        <%= Html.ActionLink("Sites & subsites >", "SiteVisits", null, new { @class = Model.IsStepAnAdvance(ImportStep.Sites) ? "ui-direction-import-forward" : "ui-direction-import-backward" })%>
    <% } else { %>
        <%= Html.ActionLink("Sites & subsites >", "SiteVisits", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Measurements) { %>
        <%= Html.ActionLink("Measurements >", "TreeMeasurements", null, new { @class = "ui-state-activate ui-direction-import-backward" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Measurements)) { %>
        <%= Html.ActionLink("Measurements >", "TreeMeasurements", null, new { @class = Model.IsStepAnAdvance(ImportStep.Measurements) ? "ui-direction-import-forward" : "ui-direction-import-backward" })%>
    <% } else { %>
        <%= Html.ActionLink("Measurements >", "TreeMeasurements", null, new { @class = "ui-state-disable" })%>       
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Review) { %>
        <%= Html.ActionLink("Review >", "Review", null, new { @class = "ui-state-activate ui-direction-import-backward" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Review)) { %>
        <%= Html.ActionLink("Review >", "Review", null, new { @class = Model.IsStepAnAdvance(ImportStep.Review) ? "ui-direction-import-forward" : "ui-direction-import-backward" })%>
    <% } else { %>
        <%= Html.ActionLink("Review >", "Review", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
    <li>
    <% if (Model.CurrentStep == ImportStep.Finish) { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = "ui-state-activate ui-direction-import-backward" })%>
    <% } else if (Model.CanAdvanceToStep(ImportStep.Finish)) { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = Model.IsStepAnAdvance(ImportStep.Finish) ? "ui-direction-import-forward" : "ui-direction-import-backward" })%>
    <% } else { %>
        <%= Html.ActionLink("Finish", "Finish", null, new { @class = "ui-state-disable" })%>
    <% } %>
    </li>
</ul>