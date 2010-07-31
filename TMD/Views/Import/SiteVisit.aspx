<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div>
    <div class="import-sitevisit-step1">
        <div class="ui-form-column ui-widget-content ui-corner-all">
            <form>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedSiteVisit.Name)%>
                    <%= Html.TextBoxFor(m => m.SelectedSiteVisit.Name)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Name, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Name, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row entercoordinates">
                    <%= Html.LabelFor(m => m.SelectedSiteVisit.CoordinatesEntered)%>
                    <%= Html.CheckBoxFor(m => m.SelectedSiteVisit.CoordinatesEntered)%>
                    <a href="javascript:SiteVisitEditor.OpenCoordinatePicker(<%= Model.Trip.HasEnteredCoordinates ? "true" : "false" %>)" class="coordinatepicker entercoordinates-visible">Pick coordinates</a>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row entercoordinates-visible latitude">
                    <%= Html.LabelFor(m => m.SelectedSiteVisit.Coordinates.Latitude)%>
                    <%= Html.TextBoxFor(m => m.SelectedSiteVisit.Coordinates.Latitude)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Latitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Latitude, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row entercoordinates-visible longitude">
                    <%= Html.LabelFor(m => m.SelectedSiteVisit.Coordinates.Longitude)%>
                    <%= Html.TextBoxFor(m => m.SelectedSiteVisit.Coordinates.Longitude)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Longitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Longitude, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedSiteVisit.Comments)%>
                    <%= Html.TextAreaFor(m => m.SelectedSiteVisit.Comments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Comments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Comments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </form>
        </div>
    </div>
    <div class="import-sitevisit-step2">
        <div class="ui-form-column ui-widget-content ui-corner-all">
            <div style="padding-left: 5px;">
                <a class="import-button-add-subsitevisit" href='javascript:SubsiteVisitEditor.Add({onClose: SiteVisitEditor.Refresh, onShow: SiteVisitEditor.Show, onHide: SiteVisitEditor.Hide})'>Add subsite visit</a>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessage("SelectedSiteVisit.SubsiteVisits", " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessage("SelectedSiteVisit.SubsiteVisits", "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
                <% if (Model.SelectedSiteVisit.SubsiteVisits.Count == 0) { %>
                    <p>Click the button above to add a subsite visit.</p>    
                <% } %>
            </div>
            <% for (int ssv = Model.SelectedSiteVisit.SubsiteVisits.Count - 1; ssv >= 0; ssv--) { %>
                <div class="ui-content-import-subsitevisit ui-widget ui-widget-content ui-corner-all">
                    <div class="ui-content-import-header ui-widget-header ui-corner-all">
                        <span class="ui-icon-import-subsitevisit"></span>
                        <a href='javascript:SubsiteVisitEditor.Edit(<%= ssv %>, {onClose: SiteVisitEditor.Refresh, onShow: SiteVisitEditor.Show, onHide: SiteVisitEditor.Hide})' class="import-button-edit">Edit</a>
                        <a href='javascript:SubsiteVisitRemover.Open(<%= ssv %>, {onClose: SiteVisitEditor.Refresh, onShow: SiteVisitEditor.Show, onHide: SiteVisitEditor.Hide})' class="import-button-remove">Remove</a>
                        <div class="ui-helper-clearfix"></div>
                    </div>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessage(string.Format("SelectedSiteVisit.SubsiteVisits[{0}]", ssv), " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessage(string.Format("SelectedSiteVisit.SubsiteVisits[{0}]", ssv), "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-content-import-summary ui-widget-content ui-corner-all">
                        Name: <%= Model.SelectedSiteVisit.SubsiteVisits[ssv].Name%>
                        <br />
                        Location: <%= Model.SelectedSiteVisit.SubsiteVisits[ssv].County%>, <%= Model.SelectedSiteVisit.SubsiteVisits[ssv].State %>
                        <br />
                        Coordinates: <%= Model.SelectedSiteVisit.SubsiteVisits[ssv].Coordinates%>
                    </div>
                </div>
            <% } %>
        </div>
    </div>
</div>
