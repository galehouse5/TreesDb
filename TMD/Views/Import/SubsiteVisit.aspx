<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class="import-subsitevisit">
    <div class="InputColumn ui-widget-content ui-corner-all">
        <form>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Name)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Name)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Name, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Name, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow country">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Country)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Country)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Country, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Country, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow state">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.State)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.State)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.State, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.State, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow county">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.County)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.County)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.County, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.County, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow EnterCoordinates InputButton">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.CoordinatesEntered)%>
                <%= Html.CheckBoxFor(m => m.SelectedSubsiteVisit.CoordinatesEntered)%>
                <a href="javascript:SubsiteVisitEditor.OpenCoordinatePicker(<%= Model.Trip.HasEnteredCoordinates ? "true" : "false" %>)" class="CoordinatePicker CoordinatesEntered">Pick coordinates</a>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow CoordinatesEntered latitude">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, new Dictionary<string, object> { { "data-degrees", Model.SelectedSiteVisit.Coordinates.Latitude.TotalDegrees } })%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow CoordinatesEntered longitude">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude, new Dictionary<string, object> { { "data-degrees", Model.SelectedSiteVisit.Coordinates.Longitude.TotalDegrees } })%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.OwnershipType)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.OwnershipType)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipType, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo)%>
                <%= Html.TextAreaFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow EnterPublicAccess InputButton">
                <label for="KeepOwnershipContactInfoPrivate">Keep private</label>
                <%= Html.RadioButtonFor(m => m.SelectedSubsiteVisit.MakeOwnershipContactInfoPublic, false, new { Id = "KeepOwnershipContactInfoPrivate" })%>
                <label for="MakeOwnershipContactInfoPublic">Make public</label>
                <%= Html.RadioButtonFor(m => m.SelectedSubsiteVisit.MakeOwnershipContactInfoPublic, true, new { Id = "MakeOwnershipContactInfoPublic" })%>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Comments)%>
                <%= Html.TextAreaFor(m => m.SelectedSubsiteVisit.Comments)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Comments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Comments, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
        </form>
    </div>
</div>