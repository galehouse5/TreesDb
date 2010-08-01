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
                <div class="ui-form-row EnterCoordinates entrybutton">
                    <%= Html.LabelFor(m => m.SelectedSiteVisit.CoordinatesEntered)%>
                    <%= Html.CheckBoxFor(m => m.SelectedSiteVisit.CoordinatesEntered)%>
                    <a href="javascript:SiteVisitEditor.OpenCoordinatePicker(<%= Model.Trip.HasEnteredCoordinates ? "true" : "false" %>)" class="CoordinatePicker CoordinatesEntered">Pick coordinates</a>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row CoordinatesEntered latitude">
                    <%= Html.LabelFor(m => m.SelectedSiteVisit.Coordinates.Latitude)%>
                    <%= Html.TextBoxFor(m => m.SelectedSiteVisit.Coordinates.Latitude)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Latitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedSiteVisit.Coordinates.Latitude, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row CoordinatesEntered longitude">
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
                <% Html.RenderPartial("SubsiteVisitSummary",
                       Model.SelectedSiteVisit.SubsiteVisits[ssv],
                       new ViewDataDictionary(ViewData) { { "EditForSelectedSiteVisit", true }, { "SubsiteVisitIndex", ssv } }); %>
            <% } %>
        </div>
    </div>
</div>
