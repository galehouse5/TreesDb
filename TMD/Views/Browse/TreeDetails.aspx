<%@ Page Title="Tree Details" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Model.Trees.Tree>" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="x6">
        <div class="portlet x12">
    	    <div class="portlet-header"><h4>General</h4></div>
    	    <div class="portlet-content">
                <ul>
                    <li><strong>Identifier:</strong> (none)</li>
                    <li><strong>Name:</strong> (none)</li>
                    <li><%= Html.DisplayFor(t => t.LastMeasurement.GeneralComments, new { label = "Comments", empty = "(none)" })%></li>
                </ul>
    	    </div>
        </div>
        <div class="portlet x12">
    	    <div class="portlet-header"><h4>Details</h4></div>
    	    <div class="portlet-content">
                <ul>
                    <li><%= Html.DisplayFor(t => t.ScientificName, new { label = "Scientific name" })%></li>
                    <li><%= Html.DisplayFor(t => t.CommonName, new { label = "Common name" })%></li>
                    <li><%= Html.DisplayFor(t => t.Height, new { format = DistanceFormat.Default, empty = "(no data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.HeightMeasurementMethod, "Enum", new { label = "Height measurement method", empty = "(no data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.Girth, new { format = DistanceFormat.Default, empty = "(no data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.CrownSpread, new { format = DistanceFormat.Default, label = "Crown spread", empty = "(no data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.ENTSPTS2, new { empty = "(not enough data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.ENTSPTS, new { empty = "(not enough data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.TDI3, new { empty = "(not enough data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.TDI2, new { empty = "(not enough data)" })%></li>
                    <% if (Model.ChampionPoints.HasValue) { %>
                        <li><%= Html.DisplayFor(t => t.ChampionPoints, new { label = "Champion points" })%></li>
                    <% } else if (Model.AbbreviatedChampionPoints.HasValue) { %>
                        <li><%= Html.DisplayFor(t => t.AbbreviatedChampionPoints, new { label = "Champion points" })%> (abbreviated)</li>
                    <% } else { %>
                        <li><strong>Champion points:</strong> (none)</li>
                    <%} %>
                    <li><%= Html.DisplayFor(t => t.Diameter, new { format = DistanceFormat.Default, empty = "(no data)" })%></li>
                    <li><%= Html.DisplayFor(t => t.ConicalVolume, new { format = VolumeFormat.Default, label = "Conical volume", empty = "(not enough data)" })%></li>
                </ul>
    	    </div>
        </div>
        <div class="portlet x12">
    	    <div class="portlet-header"><h4>Measurements</h4></div>
    	    <div class="portlet-content">
                <table class="reports_table">
                    <% foreach(var measurement in Model.ChronologicalMeasurements) { %> 
                        <% int measurementIndex = Model.Measurements.IndexOf(measurement); %>
                        <tr>
                            <td class="description">
                                <a href="<%= Url.Action("TreeMeasurementDetails", new { id = Model.Measurements[measurementIndex].Id }) %>">
                                    <%= Html.DisplayFor(m => m.Measurements[measurementIndex].Measured, new { label = string.Empty })%>
                                </a>
                            </td>
						    <td class="description">
                                <strong>Measurer:</strong>
                                <ul>
                                    <% foreach(var measurer in measurement.Measurers) { %>
                                        <% int measurerIndex = measurement.Measurers.IndexOf(measurer); %>
                                        <li><%= Html.DisplayFor(m => m.Measurements[measurementIndex].Measurers[measurerIndex], new { label = string.Empty })%></li>
                                    <% } %>
                                </ul>
                            </td>
                        </tr>
                    <% } %>
                </table>
    	    </div>
        </div>
    </div>
    <div class="x6">
        <div class="portlet x12">
    	    <div class="portlet-header"><h4>Location</h4></div>
    	    <div class="portlet-content">
                hello world
    	    </div>
        </div>
        <div class="portlet x12">
    	    <div class="portlet-header"><h4>Photos</h4></div>
    	    <div class="portlet-content">
                <% if ((from measurement in Model.Measurements from photo in Model.Photos select photo).Count() == 0) { %>
                    (no photos)
                <% } else { %>
                    <table class="reports_table">
                        <% foreach(var measurement in Model.ChronologicalMeasurements) { %>
                            <% int measurementIndex = Model.Measurements.IndexOf(measurement); %>
                            <% foreach (var photo in measurement.Photos) { %>
                                <% int photoIndex = measurement.Photos.IndexOf(photo); %>
                                <tr>
                                    <td class="description">
                                        <ul class="gallery">
                                            <%= Html.DisplayFor(m => m.Measurements[measurementIndex].Photos[photoIndex], "IPhoto") %>
                                        </ul>
                                    </td>
						            <td class="description">
                                        <strong>Credit:</strong>
                                        <ul>
                                            <% foreach(var measurer in measurement.Measurers) { %>
                                                <% int measurerIndex = measurement.Measurers.IndexOf(measurer); %>
                                                <li><%= Html.DisplayFor(m => m.Measurements[measurementIndex].Measurers[measurerIndex], new { label = string.Empty })%></li>
                                            <% } %>
                                        </ul>
                                        <%= Html.DisplayFor(m => m.Measurements[measurementIndex].Measured, new { label = "Date" })%>
                                    </td>
                                </tr>
                            <% } %>
                        <% } %>
                    </table>
                <% } %>
    	    </div>
        </div>
    </div>
</asp:Content>
