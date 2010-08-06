<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div class='Placeholder'>
    <div class='GeneralSection'>
        <div class="InputRow CommonName">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CommonName)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CommonName)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CommonName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CommonName, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow ScientificName">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.ScientificName)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ScientificName)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ScientificName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ScientificName, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow Height"></div>
        <div class="InputRow HeightMeasurementMethod"></div>
        <div class="InputRow Girth"></div>
        <div class="InputRow" style="margin-left: 100px;">
            (Use the girth tab if not measured from 4.5 feet)
        </div>
        <div class="InputRow CrownSpread"></div>
        <div class="InputRow EnterCoordinates InputButton">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CoordinatesEntered)%>
            <%= Html.CheckBoxFor(m => m.SelectedTreeMeasurement.CoordinatesEntered)%>
            <a href="javascript:SingleTrunkTreeMeasurementEditor.OpenCoordinatePicker(<%= Model.Trip.HasEnteredCoordinates ? "true" : "false" %>)" class="CoordinatePicker CoordinatesEntered">Pick coordinates</a>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow CoordinatesEntered latitude">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow CoordinatesEntered longitude">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow EnterPublicAccess CoordinatesEntered InputButton">
            <label for="KeepCoordinatesPrivate">Keep private</label>
            <%= Html.RadioButtonFor(m => m.SelectedTreeMeasurement.MakeCoordinatesPublic, false, new { Id = "KeepCoordinatesPrivate" })%>
            <label for="MakeCoordinatesPublic">Make public</label>
            <%= Html.RadioButtonFor(m => m.SelectedTreeMeasurement.MakeCoordinatesPublic, true, new { Id = "MakeCoordinatesPublic" })%>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GeneralComments)%>
            <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.GeneralComments)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GeneralComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GeneralComments, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
    <div class='HeightSection'>
        <div class="InputRow height-simple-visible Height">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Height)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Height)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Height, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Height, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow HeightMeasurementMethod">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurementMethod)%>
            <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.HeightMeasurementMethod, ModelExtensions.BuildSelectList<TreeHeightMeasurementMethod>())%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurementMethod, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurementMethod, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurementType)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurementType)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurementType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurementType, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.LaserBrand)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LaserBrand)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LaserBrand, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LaserBrand, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ClinometerBrand, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ClinometerBrand, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow InputButton EnterDistanceAndAngleMeasurements">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.IncludeHeightDistanceAndAngleMeasurements)%>
            <%= Html.CheckBoxFor(m => m.SelectedTreeMeasurement.IncludeHeightDistanceAndAngleMeasurements)%>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow DistanceAndAngleMeasurementsEntered">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow DistanceAndAngleMeasurementsEntered">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>                
        <div class="InputRow DistanceAndAngleMeasurementsEntered">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow DistanceAndAngleMeasurementsEntered">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow DistanceAndAngleMeasurementsEntered">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow DistanceAndAngleMeasurementsEntered" style="float: left; margin-left: 100px">
            <a href="javascript:SingleTrunkTreeMeasurementEditor.CalculateDetailedHeightMeasurements()" class="CalculateHeightAndOffset">Calculate height and offset</a>
        </div>
        <div class="InputRow DistanceAndAngleMeasurementsEntered">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height, new { disabled = true })%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow DistanceAndAngleMeasurementsEntered">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset, new { disabled = true })%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightComments)%>
            <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.HeightComments)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightComments, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
    <div class='GirthSection'>
        <div class="InputRow Girth">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Girth)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Girth)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Girth, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Girth, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthComments)%>
            <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.GirthComments)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthComments, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
    <div class='CrownSection'>
        <div class="InputRow CrownSpread">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownSpread)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownSpread)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownSpread, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownSpread, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.MaximumLimbLength)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.MaximumLimbLength)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumLimbLength, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumLimbLength, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.BaseCrownHeight)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.BaseCrownHeight)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.BaseCrownHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.BaseCrownHeight, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownVolume)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownVolume)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolume, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolume, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownComments)%>
            <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.CrownComments)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownComments, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
    <div class='TrunkSection'>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolume)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolume)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolume, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolume, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkComments)%>
            <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TrunkComments)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkComments, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TreeFormComments)%>
            <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TreeFormComments)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeFormComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeFormComments, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
    <div class='StatusSection'>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Age)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Age)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Age, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Age, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeClass)%>
            <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeClass, ModelExtensions.BuildSelectList<TreeAgeClass>())%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeClass, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeClass, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeType)%>
            <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeType, ModelExtensions.BuildSelectList<TreeAgeType>())%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeType, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Status)%>
            <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.Status, ModelExtensions.BuildSelectList<TreeStatus>())%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Status, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Status, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HealthStatus)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HealthStatus)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HealthStatus, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HealthStatus, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
    <div class='MiscSection'>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TreeNumber)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TreeNumber)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeNumber, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeNumber, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TreeName)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TreeName)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeName, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Elevation)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Elevation)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Elevation, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Elevation, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainType)%>
            <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.TerrainType, ModelExtensions.BuildSelectList<TreeTerrainType>())%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainType, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.LandformIndex)%>
            <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LandformIndex)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LandformIndex, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LandformIndex, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputRow">
            <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainComments)%>
            <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TerrainComments)%>
            <div class="ValidationError ui-state-error-text">
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainComments, "", new { @class = "ValidationErrorMessage" })%>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
</div>