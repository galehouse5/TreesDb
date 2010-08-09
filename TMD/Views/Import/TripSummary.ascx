<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.Trip>" %>
<div class="ImportTripSummary ui-widget ui-widget-content ui-corner-all">
    <div class="ImportEntitySummaryHeader ui-widget-header ui-corner-all">
        <span class="ImportTripIcon"></span>
        <% if (true.Equals(ViewData["Edit"])) { %>
            <% using(Html.BeginForm("ContinueNotYetFinishedImport", "Import")) { %>
                <%= Html.Hidden("tripIndex", ViewData["TripIndex"] ) %>
                <button type="submit" class="ImportEditButton">Continue</button>
            <% } %>
            <a href='javascript:TripRemover.Open(<%= ViewData["TripIndex"] %>, TripsEditor.Refresh)' class="ImportRemoveButton">Remove</a>
        <% } %>
        <% if (true.Equals(ViewData["Imported"])) { %>
            <% using(Html.BeginForm("ViewFinishedImport", "Import")) { %>
                <%= Html.Hidden("tripIndex", ViewData["TripIndex"] ) %>
                <button type="submit" class="ImportViewButton">View</button>
            <% } %>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="ImportEntitySummary ui-widget-content ui-corner-all">
        <% if (string.IsNullOrWhiteSpace(Model.Name)) { %>
            (name not entered)
        <% } else {%>
            <%= Model.Name %>
        <% } %>
        <br />
        <% if (Model.Date != null) { %>
            Visited on <%= ((DateTime)Model.Date).ToString("MM/dd/yyyy") %>
            <br />
        <% } %>
        <% if (true.Equals(ViewData["Edit"])) { %>
            Import started <% Html.RenderPartial("FriendlyPastTimeSpanWithDaysPrecision", DateTime.Now.Subtract(Model.Created)); %>
        <% } %>
        <% if (true.Equals(ViewData["Imported"])) { %>
            Imported <% Html.RenderPartial("FriendlyPastTimeSpanWithDaysPrecision", DateTime.Now.Subtract(Model.LastSaved)); %>
        <% } %>
    </div>
</div>

