<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class="import-subsitevisit">
    <div class="ui-form-column ui-widget-content ui-corner-all">
        <form>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Name)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Name)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Name, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Name, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row country">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Country)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Country)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Country, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Country, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row state">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.State)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.State)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.State, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.State, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row county">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.County)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.County)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.County, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.County, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row EnterCoordinates entrybutton">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.CoordinatesEntered)%>
                <%= Html.CheckBoxFor(m => m.SelectedSubsiteVisit.CoordinatesEntered)%>
                <a href="javascript:SubsiteVisitEditor.OpenCoordinatePicker(<%= Model.Trip.HasEnteredCoordinates ? "true" : "false" %>)" class="CoordinatePicker CoordinatesEntered">Pick coordinates</a>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row CoordinatesEntered latitude">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, new Dictionary<string, object> { { "data-degrees", Model.SelectedSiteVisit.Coordinates.Latitude.TotalDegrees } })%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row CoordinatesEntered longitude">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude, new Dictionary<string, object> { { "data-degrees", Model.SelectedSiteVisit.Coordinates.Longitude.TotalDegrees } })%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.OwnershipType)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.OwnershipType)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipType, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo)%>
                <%= Html.TextAreaFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-form-row EnterPublicAccess entrybutton">
                <label for="KeepOwnershipContactInfoPrivate">Keep private</label>
                <%= Html.RadioButtonFor(m => m.SelectedSubsiteVisit.MakeOwnershipContactInfoPublic, false, new { Id = "KeepOwnershipContactInfoPrivate" })%>
                <label for="MakeOwnershipContactInfoPublic">Make public</label>
                <%= Html.RadioButtonFor(m => m.SelectedSubsiteVisit.MakeOwnershipContactInfoPublic, true, new { Id = "MakeOwnershipContactInfoPublic" })%>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Comments)%>
                <%= Html.TextAreaFor(m => m.SelectedSubsiteVisit.Comments)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Comments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Comments, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
        </form>
    </div>
</div>