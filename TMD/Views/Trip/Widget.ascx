<%@ Control Language="C#" Inherits="TMD.ViewUserControlBase<TMD.Model.Trips.Trip>" %>
<div class="TripWidget ui-widget ui-widget-content ui-corner-all" data-tripid="<%= Model.Id %>">
    <div class="Header ui-widget-header ui-corner-all">
        <span class="Icon"></span>
        <% if (ViewData.GetWidgetOptions<ETripWidgetOptions>() == ETripWidgetOptions.Edit) { %>
            <%= Html.ActionLink("Continue", "Continue", "Import", new { id = Model.Id }, new { @class = "Edit" })%>
            <%= Html.ActionLink("Remove", "Delete", "Trip", new { id = Model.Id }, new { @class = "Remove" })%>
        <% } %>
        <% if (ViewData.GetWidgetOptions<ETripWidgetOptions>() == ETripWidgetOptions.View) { %>
            <%= Html.ActionLink("View", "Finish", "Import", new { id = Model.Id }, new { @class = "View" }) %>
        <% } %>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="Content ui-widget-content ui-corner-all">
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
        <% if (Model.IsImported) { %>
            Imported <% Html.RenderPartial("FriendlyPastTimeSpanWithDaysPrecision", DateTime.Now.Subtract(Model.LastSaved)); %>
        <% } else { %>
            Import started <% Html.RenderPartial("FriendlyPastTimeSpanWithDaysPrecision", DateTime.Now.Subtract(Model.Created)); %>
        <% } %>
    </div>
</div>

