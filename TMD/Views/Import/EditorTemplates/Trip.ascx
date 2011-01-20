<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Trip>" %>
<%@ Import Namespace="TMD.Model.Imports" %>
<div class="portlet x12 Trip">
    <div class="portlet-header Trip-Header Entity-Header">
        <% if (Model.IsImported) { %>
            <h4><%: Model.Name %>&nbsp;</h4>
            <div class="actions">
                <%= Html.ActionLink("View", "View", "Import", new { id = Model.Id }, new { @class = "btn btn-orange btn-small" })%>
                <%= Html.ActionLink("Revise", "Trip", "Import", new { id = Model.Id }, new { @class = "btn btn-orange btn-small" })%>
                <button type="submit" class="btn btn-orange btn-small" name="innerAction" value="Trip.<%= Model.Id %>.Remove">Remove</button>
            </div>
        <% } else { %>
            <h4><%: Model.Name %> (started <%= Html.DisplayFor(m => m.EntityAge, "FriendlyPastTimeSpan") %>) &nbsp;</h4>
            <div class="actions">
                <%= Html.ActionLink("Continue", "Trip", "Import", new { id = Model.Id }, new { @class = "btn btn-orange btn-small" }) %>
                <button type="submit" class="btn btn-orange btn-small" name="innerAction" value="Trip.<%= Model.Id %>.Remove">Remove</button>
            </div>
        <% } %>
    </div>
    <div class="portlet-content">
        <ul>
            <% if (Model.Date.HasValue) { %>
                <li><%= Html.DisplayFor(m => m.Date.Value, new { label = "Visited" })%></li>
            <% } %>
            <% if (Model.Sites.Count > 0) { %>
                <li><strong>Sites:</strong><ul>
                <% foreach (var sv in Model.Sites) { %>
                    <li><%: sv.Name %></li>
                <% } %>
                </ul></li>
            <%} %>
            <% if (Model.Measurers.Count(m => m.IsSpecified) > 0) { %>
                <li><strong>Measurers:</strong><ul>
                <% foreach (var measurer in Model.Measurers.Where(m => m.IsSpecified)) { %>
                    <li><%: measurer.ToFormalName()%></li>
                <% } %>
                </ul></li>
            <%  } %>
        </ul>
    </div>
</div>
