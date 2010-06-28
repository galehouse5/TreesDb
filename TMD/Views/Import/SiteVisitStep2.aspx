<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div class="sitevisit-placeholder">
    <form id="siteVisitForm" method="post" action="">
        <p>
            Click <a class='subsite-visit' href="javascript:SubsiteVisitEditor.Add()">Add subsite visit</a> to build a list of the subsites you visited at this site.
        </p>
        <%= Html.ValidationMessage("SelectedSiteVisit.SubsiteVisits") %>
        <ul class="subsite-visit-list">
        <% for (int ssv = 0; ssv < Model.SelectedSiteVisit.SubsiteVisits.Count; ssv++) { %>
            <li class="subsite-visit">
                <span class="icon"></span>
                <div class="column">
                    <span><%= Model.SelectedSiteVisit.SubsiteVisits[ssv].Name %></span>
                    <%= Html.ValidationMessage(string.Format("SelectedSiteVisit.SubsiteVisits[{0}]", ssv)) %>
                    <br />
                    <a href="javascript:SubsiteVisitEditor.Edit(<%= ssv %>)">Edit</a>
                    <a href="javascript:SubsiteVisitEditor.Remove(<%= ssv %>)">Remove</a>
                </div>
                <div class="ui-helper-clearfix"></div>
            </li>
        <% } %>
        </ul>
    </form>
</div>