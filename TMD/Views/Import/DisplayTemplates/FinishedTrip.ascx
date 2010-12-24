<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportFinishedTripModel>" %>
<div class="portlet x12 Site">        
    <div class="portlet-header Entity-Header Trip-Header">
        <h4><%: Model.Name %></h4>
    </div>
    <div class="portlet-content">
        <%= Html.HiddenFor(m => m.Id) %>
        <ul>
            <li><%= Html.DisplayFor(m => m.Date.Value, new { label = "Date" })%> </li>
            <li><%= Html.DisplayFor(m => m.MeasurerContactInfo) %></li>
            <li><%= Html.DisplayFor(m => m.FirstMeasurer) %></li>
            <% if (!string.IsNullOrWhiteSpace(Model.SecondMeasurer)) { %>
                <li><%= Html.DisplayFor(m => m.SecondMeasurer) %></li>
            <% } %>
            <% if (!string.IsNullOrWhiteSpace(Model.ThirdMeasurer)) { %>
                <li><%= Html.DisplayFor(m => m.ThirdMeasurer)%></li>
            <% } %>
        </ul>
        <% for (int i = 0; i < Model.Sites.Count; i++) { %>
            <%= Html.DisplayFor(m => m.Sites[i], "FinishedSite") %>
        <% } %>
    </div>
</div>
