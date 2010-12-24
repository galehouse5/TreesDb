<%@ Page Title="Import History" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<IList<Trip>>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="Styles" runat="server">
    <link rel="stylesheet" href="/css/Import.css" type="text/css" />
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <% var tripsPendingImport = Model.Where(m => !m.IsImported).ToList(); %>
    <% if (tripsPendingImport.Count > 0) { %>
        <div class="portlet x12">
			<div class="portlet-header">
                <h4>Imports you need to continue</h4>
            </div>
			<div class="portlet-content">
                <% for(int i = 0; i < tripsPendingImport.Count; i++) { %>
                <% Trip t = tripsPendingImport[i]; %>
                <div class="portlet x6">
			        <div class="portlet-header Trip-Header Entity-Header">
                        <h4><%: t.Name %>&nbsp;</h4>
                        <div class="actions">
                            <%= Html.ActionLink("Continue", "Trip", "Import", new { id = t.Id }, new { @class = "btn btn-orange btn-small"  }) %>
                            <%= Html.ActionLink("Remove", "Remove", "Import", new { id = t.Id }, new { @class = "btn btn-orange btn-small" })%>
                        </div>
                    </div>
			        <div class="portlet-content">
                        <ul>
                            <% if (t.Date.HasValue) { %>
                                <li><strong>Visited:</strong> <%= t.Date.Value.ToString("MM/dd/yyyy") %></li>
                            <% } %>
                            <% if (t.SiteVisits.Count > 0) { %>
                                <li><strong>Sites:</strong><ul>
                                <% foreach (SiteVisit sv in t.SiteVisits) { %>
                                    <li><%: sv.Name %></li>
                                <% } %>
                                </ul></li>
                            <%} %>
                            <% if (t.Measurers.Count(m => m.IsSpecified) > 0) { %>
                                <li><strong>Measurers:</strong><ul>
                                <% foreach (Measurer m in t.Measurers.Where(m => m.IsSpecified)) { %>
                                    <li><%: m.FirstName %> <%: m.LastName %></li>
                                <% } %>
                                </ul></li>
                            <%  } %>
                            <li><strong>Import started:</strong> <%= Html.DisplayFor(m => m[Model.IndexOf(t)].EntityAge, "FriendlyPastTimeSpan") %></li>
                        </ul>
			        </div>
		        </div>
            <% } %>
			</div>
		</div>
    <% } %>

    <% var importedTrips = Model.Where(m => m.IsImported).ToList(); %>
    <% for(int i = 0; i < importedTrips.Count; i++) { %>
        <% Trip t = importedTrips[i]; %>
        <div class="portlet x6">
			<div class="portlet-header Trip-Header Entity-Header">
                <h4><%: t.Name %>&nbsp;</h4>
                <div class="actions">
                    <%= Html.ActionLink("View", "View", "Import", new { id = t.Id }, new { @class = "btn btn-orange btn-small"  }) %>
                    <%= Html.ActionLink("Revise", "Revise", "Import", new { id = t.Id }, new { @class = "btn btn-orange btn-small"  }) %>
                    <%= Html.ActionLink("Remove", "Remove", "Import", new { id = t.Id }, new { @class = "btn btn-orange btn-small" })%>
                </div>
            </div>
			<div class="portlet-content">
                <ul>
                    <% if (t.Date.HasValue) { %>
                        <li><strong>Visited:</strong> <%= t.Date.Value.ToString("MM/dd/yyyy") %></li>
                    <% } %>
                    <% if (t.SiteVisits.Count > 0) { %>
                        <li><strong>Sites:</strong><ul>
                        <% foreach (SiteVisit sv in t.SiteVisits) { %>
                            <li><%: sv.Name %></li>
                        <% } %>
                        </ul></li>
                    <%} %>
                    <% if (t.Measurers.Count > 0) { %>
                        <li><strong>Measurers:</strong><ul>
                        <% foreach (Measurer m in t.Measurers) { %>
                            <li><%: m.FirstName %> <%: m.LastName %></li>
                        <% } %>
                        </ul></li>
                    <%  } %>
                    <li><strong>Imported:</strong> <%= Html.DisplayFor(m => m[Model.IndexOf(t)].ImportAge, "FriendlyPastTimeSpan")%></li>
                </ul>
			</div>
		</div>
    <% } %>
</asp:Content>
