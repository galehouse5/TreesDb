<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div id="TrunkMeasurementEditor">
    <div class="Placeholder InputColumn ui-widget-content ui-corner-all">
        <form>
            <div class="InputRow Girth">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.Girth)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.Girth)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.Girth, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.Girth, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow Girth">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.GirthMeasurementHeight)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.GirthMeasurementHeight)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.GirthMeasurementHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.GirthMeasurementHeight, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow height-simple-visible Height">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.Height)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.Height)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.Height, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.Height, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow InputButton EnterDistanceAndAngleMeasurements">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.IncludeHeightDistanceAndAngleMeasurements)%>
                <%= Html.CheckBoxFor(m => m.SelectedTrunkMeasurement.IncludeHeightDistanceAndAngleMeasurements)%>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow DistanceAndAngleMeasurementsEntered">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleTop)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleTop)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleTop, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleTop, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow DistanceAndAngleMeasurementsEntered">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceTop)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceTop)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceTop, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceTop, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>                
            <div class="InputRow DistanceAndAngleMeasurementsEntered">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.VerticalOffset)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.VerticalOffset)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.VerticalOffset, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.VerticalOffset, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow DistanceAndAngleMeasurementsEntered">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleBottom)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleBottom)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleBottom, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.AngleBottom, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow DistanceAndAngleMeasurementsEntered">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceBottom)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceBottom)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceBottom, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.DistanceBottom, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow DistanceAndAngleMeasurementsEntered" style="float: left; margin-left: 100px">
                <a href="javascript:TrunkMeasurementEditor.CalculateDetailedHeightMeasurements()" class="CalculateHeightAndOffset">Calculate height and offset</a>
            </div>
            <div class="InputRow DistanceAndAngleMeasurementsEntered">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Height)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Height, new { disabled = true })%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Height, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Height, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow DistanceAndAngleMeasurementsEntered">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Offset)%>
                <%= Html.TextBoxFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Offset, new { disabled = true })%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Offset, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.HeightMeasurements.Offset, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.SelectedTrunkMeasurement.TrunkComments)%>
                <%= Html.TextAreaFor(m => m.SelectedTrunkMeasurement.TrunkComments)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.TrunkComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.SelectedTrunkMeasurement.TrunkComments, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
        </form>
    </div>
</div>
