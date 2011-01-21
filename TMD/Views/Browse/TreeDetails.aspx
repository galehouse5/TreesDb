<%@ Page Title="Tree Details" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<TreeDetailsModel>" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="x6">
        <div class="portlet x12">
    	    <div class="portlet-header"><h4>Single trunk tree</h4></div>
    	    <div class="portlet-content department">
                <table class="reports_table">
                    <tr><%= Html.DisplayFor(m => m.Tree.ScientificName, new { label = "Scientific name" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.CommonName, new { label = "Common name" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.LastMeasurement.GeneralComments, new { label = "Comments", empty = "(none)", highlight = false })%></tr>
                </table>
                <h2>Details</h2>
                <table class="reports_table">
                    <tr><%= Html.DisplayFor(m => m.Tree.Height, new { format = DistanceFormat.Default, empty = "(no data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.HeightMeasurementMethod, "Enum", new { label = "Height measurement method", empty = "(no data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.Girth, new { format = DistanceFormat.Default, empty = "(no data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.CrownSpread, new { format = DistanceFormat.Default, label = "Crown spread", empty = "(no data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.ENTSPTS2, new { empty = "(not enough data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.ENTSPTS, new { empty = "(not enough data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.TDI3, new { empty = "(not enough data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.TDI2, new { empty = "(not enough data)" })%></tr>
                    <% if (Model.Tree.ChampionPoints.HasValue) { %>
                        <tr><%= Html.DisplayFor(m => m.Tree.ChampionPoints, new { label = "Champion points" })%></tr>
                    <% } else if (Model.Tree.AbbreviatedChampionPoints.HasValue) { %>
                        <tr><%= Html.DisplayFor(m => m.Tree.AbbreviatedChampionPoints, new { label = "Champion points (abbreviated)" })%></tr>
                    <% } else { %>
                        <tr><td class="description">Champion points</td><td class="value">(not enough data)</td></tr>
                    <% } %>
                    <tr><%= Html.DisplayFor(m => m.Tree.Diameter, new { format = DistanceFormat.Default, empty = "(no data)" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.ConicalVolume, new { format = VolumeFormat.Default, label = "Conical volume", empty = "(not enough data)" })%></tr>
                </table>
                <h2>Measurements</h2>
                <table class="support_table">
                    <% for(int measurementIndex = 0; measurementIndex < Model.Measurements.Count; measurementIndex++) { %> 
                        <tr>
                            <td>
                                <span class="ticket open"><%: Model.Measurements[measurementIndex].Measured.ToString("MM/dd/yyyy") %></span>
                            </td>
                            <td class="full">
                                Measured by <%= Html.DisplayFor(m => m.Measurements[measurementIndex].Measurers, "NameSeries")%>
                            </td>
                            <td class="who">
                                <a href="<%= Url.Action("TreeMeasurementDetails", new { id = Model.Measurements[measurementIndex].Id }) %>">View details</a>
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
                <table class="reports_table">
                    <tr><%= Html.DisplayFor(m => m.Tree.ScientificName, new { label = "Scientific name" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.CommonName, new { label = "Common name" })%></tr>
                    <tr><%= Html.DisplayFor(m => m.Tree.LastMeasurement.GeneralComments, new { label = "Comments", empty = "(none)", highlight = false })%></tr>
                </table>
    	    </div>
        </div>
        <div class="portlet x12">
    	    <div class="portlet-header"><h4>Photos</h4></div>
    	    <div class="portlet-content">
                <%= Html.DisplayFor(m => m.DatedPhotos, "PhotosHistory") %>
    	    </div>
        </div>
    </div>
</asp:Content>
