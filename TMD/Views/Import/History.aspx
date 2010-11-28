<%@ Page Title="Import History" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<ImportTripsModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% if (Model.PendingTrips.Count > 0) { %>
        <div class="portlet x12">
			<div class="portlet-header">
                <h4>Imports you need to continue</h4>
            </div>
			<div class="portlet-content">
                <% for(int i = 0; i < Model.PendingTrips .Count; i++) { %>
                <% Trip t = Model.PendingTrips[i]; %>
                <div class="portlet x6">
			        <div class="portlet-header trip-header entity-header">
                        <h4><%= t.Name %>&nbsp;</h4>
                        <div class="actions">
                            <%= Html.ActionLink("Continue", "Trips", "Import", new { id = t.Id, action = "Continue" }, new { @class = "btn btn-orange btn-small"  }) %>
                            <%= Html.ActionLink("Remove", "Trips", "Import", new { id = t.Id, action = "Remove" }, new { @class = "btn btn-orange btn-small" })%>
                        </div>
                    </div>
			        <div class="portlet-content">
                        <ul>
                            <% if (t.Date.HasValue) { %>
                                <li><strong>Visited:</strong> <%= t.Date.Value.ToString("MM/dd/yyyy") %></li>
                            <% } %>
                            <% if (t.HasSiteVisits) { %>
                                <li><strong>Sites:</strong><ul>
                                <% foreach (SiteVisit sv in t.SiteVisits) { %>
                                    <li><%= sv.Name %></li>
                                <% } %>
                                </ul></li>
                            <%} %>
                            <% if (t.Measurers.Count > 0) { %>
                                <li><strong>Measurers:</strong><ul>
                                <% foreach (Measurer m in t.Measurers) { %>
                                    <li><%= m.FirstName %> <%= m.LastName %></li>
                                <% } %>
                                </ul></li>
                            <%  } %>
                            <li><strong>Import started:</strong> <%= Html.DisplayFor(m => m.PendingTrips[i].Age, "FriendlyPastTimeSpan") %></li>
                        </ul>
			        </div>
		        </div>

            <% } %>
			</div>
		</div>
    <% } %>
    
    <% for(int i = 0; i < Model.ImportedTrips.Count; i++) { %>
        <% Trip t = Model.ImportedTrips[i]; %>
        <div class="portlet x6">
			<div class="portlet-header trip-header entity-header">
                <h4><%= t.Name %>&nbsp;</h4>
                <div class="actions">
                    <%= Html.ActionLink("View", "Trips", "Import", new { id = t.Id, action = "View" }, new { @class = "btn btn-orange btn-small"  }) %>
                    <%= Html.ActionLink("Revise", "Trips", "Import", new { id = t.Id, action = "Revise" }, new { @class = "btn btn-orange btn-small"  }) %>
                    <%= Html.ActionLink("Remove", "Trips", "Import", new { id = t.Id, action = "Remove" }, new { @class = "btn btn-orange btn-small" })%>
                </div>
            </div>
			<div class="portlet-content">
                <ul>
                    <% if (t.Date.HasValue) { %>
                        <li><strong>Visited:</strong> <%= t.Date.Value.ToString("MM/dd/yyyy") %></li>
                    <% } %>
                    <% if (t.HasSiteVisits) { %>
                        <li><strong>Sites:</strong><ul>
                        <% foreach (SiteVisit sv in t.SiteVisits) { %>
                            <li><%= sv.Name %></li>
                        <% } %>
                        </ul></li>
                    <%} %>
                    <% if (t.Measurers.Count > 0) { %>
                        <li><strong>Measurers:</strong><ul>
                        <% foreach (Measurer m in t.Measurers) { %>
                            <li><%= m.FirstName %> <%= m.LastName %></li>
                        <% } %>
                        </ul></li>
                    <%  } %>
                    <li><strong>Imported:</strong> <%= Html.DisplayFor(m => m.ImportedTrips[i].ImportAge, "FriendlyPastTimeSpan")%></li>
                </ul>
			</div>
		</div>
    <% } %>
</asp:Content>
