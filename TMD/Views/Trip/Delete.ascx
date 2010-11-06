<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.Trip>" %>
<div id="TripRemover" title="Removing trip" data-tripid="<%= Model.Id %>">
    <% using (Html.BeginForm()) { %>
        <p>
            Are you sure you want to remove this trip?
        </p>
        <% Html.RenderPartial("Widget", Model); %>
    <% } %>
</div>
