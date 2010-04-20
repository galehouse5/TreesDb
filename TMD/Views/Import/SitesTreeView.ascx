<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Models" %>
<ul id="SiteList">
<% for (int s = 0; s < Model.Sites.Count; s++) { %>
    <li id="<%= Model.Sites[s].Id %>" class="Site">
        <span class="Icon"></span>
        <div>
            <span class="Name"><%= Model.Sites[s].Name %></span>
            <br />
            <% if (Model.CurrentStep == EImportStep.SiteInfo) { %>
            <a href="javascript:AddSubsite('<%= Model.Sites[s].Id %>')">Add subsite</a>
            <a href="javascript:EditSite('<%= Model.Sites[s].Id %>')">Edit</a>
            <a href="javascript:DeleteSite('<%= Model.Sites[s].Id %>')">Delete</a>
            <% } else if (Model.CurrentStep == EImportStep.Measurements) { %>
            <a href="javascript:AddSiteMeasurement('<%= Model.Sites[s].Id %>')">Add measurement</a>
            <div class="Column">
                <%= Html.Hidden(Model.Sites[s].Id.ToString(), Model.Sites[s].Measurements.Count)%>
            </div>
            <% } %>
        </div>
        <ul class="MeasurementList">
        <% for (int m = 0; m < Model.Sites[s].Measurements.Count; m++) { %>
            <li id="<%= Model.Sites[s].Measurements[m].Id %>" class="Measurement">
                <span class="Icon"></span>
                <div class="Column">
                    <span class="Genus"><%= Model.Sites[s].Measurements[m].Genus %></span>
                    <span class="Species"><%= Model.Sites[s].Measurements[m].Species %></span>
                    <br />
                    <span class="CommonName"><%= Model.Sites[s].Measurements[m].CommonName %></span>
                </div>
                <% if (Model.CurrentStep == EImportStep.Measurements) { %>
                <div class="Column">
                    <a href="javascript:EditSiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Measurements[m].Id %>')">Edit</a>
                    <br />
                    <a href="javascript:DeleteSiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Measurements[m].Id %>')">Delete</a>
                </div>
                <% } %>
                <div class="ui-helper-clearfix"></div>
            </li>
        <% } %>
        </ul>
        <ul class="SubsiteList">
        <% for (int ss = 0; ss < Model.Sites[s].Subsites.Count; ss++) { %>
            <li id="<%= Model.Sites[s].Subsites[ss].Id %>" class="Subsite">
                <span class="Icon"></span>
                <div>
                    <span class="Name"><%= Model.Sites[s].Subsites[ss].Name %></span>
                    <br />
                    <% if (Model.CurrentStep == EImportStep.SiteInfo) { %>
                    <a href="javascript:EditSubsite('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>')">Edit</a>
                    <a href="javascript:DeleteSubsite('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>')">Delete</a>
                    <% } else if (Model.CurrentStep == EImportStep.Measurements) { %>
                    <a href="javascript:AddSubsiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>')">Add measurement</a>
                    <div class="Column">
                        <%= Html.Hidden(Model.Sites[s].Subsites[ss].Id.ToString(""), Model.Sites[s].Subsites[ss].Measurements.Count)%>
                    </div>
                    <% } %>
                </div>
                <ul class="MeasurementList">
                    <% for (int m = 0; m < Model.Sites[s].Subsites[ss].Measurements.Count; m++) { %>
                    <li id="<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>" class="Measurement">
                        <span class="Icon"></span>
                        <div class="Column">
                            <span class="Genus"><%= Model.Sites[s].Subsites[ss].Measurements[m].Genus %></span>
                            <span class="Species"><%= Model.Sites[s].Subsites[ss].Measurements[m].Species %></span>
                            <br />
                            <span class="CommonName"><%= Model.Sites[s].Subsites[ss].Measurements[m].CommonName %></span>
                        </div>
                        <% if (Model.CurrentStep == EImportStep.Measurements) { %>
                        <div class="Column">
                            <a href="javascript:EditSubsiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>', '<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>')">Edit</a>
                            <br />
                            <a href="javascript:DeleteSubsiteMeasurement('<%= Model.Sites[s].Id %>', '<%= Model.Sites[s].Subsites[ss].Id %>', '<%= Model.Sites[s].Subsites[ss].Measurements[m].Id %>')">Delete</a>
                        </div>
                        <% } %>
                        <div class="ui-helper-clearfix"></div>
                    </li>
                    <% } %>
                </ul>
            </li>
        <% } %>
        </ul>
    </li>
<% } %>
</ul>