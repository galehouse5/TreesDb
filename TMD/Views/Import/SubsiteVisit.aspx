<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class="ui-placeholder-import-subsitevisit">
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
            <div class="ui-form-row state">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.State)%>
                <%= Html.DropDownListFor(m => m.SelectedSubsiteVisit.State, Model.BuildStateSelectList())%>
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
            <div class="ui-form-row coordinates-entered" style="float: left; margin-left: 10px;">
                <span>Enter coordinates to simplify remaining steps?</span>
                <%= Html.CheckBoxFor(m => m.SelectedSubsiteVisit.CoordinatesEntered)%>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row coordinates-entered-visible" style="float: left; margin-left: 100px">
                <a href="javascript:SubsiteVisitEditor.OpenCoordinatePicker()" class="coordinate-picker">Open coordinate picker</a>
            </div>
            <div class="ui-form-row coordinates-entered-visible latitude">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude)%>
                <div class="ui-validation-error ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, "", new { @class = "ui-validation-error-message" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-form-row coordinates-entered-visible longitude">
                <%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude)%>
                <%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude)%>
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