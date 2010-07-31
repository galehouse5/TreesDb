<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div>
    <form>
        <div class='tabs'>
            <ul>
                <li><a href='#editor-treemeasurement-general' class='placeholder-general'>General</a></li>
                <li><a href='#editor-treemeasurement-height' class='placeholder-height'>Height</a></li>
                <li><a href='#editor-treemeasurement-girth' class='placeholder-girth'>Girth</a></li>
                <li><a href='#editor-treemeasurement-trunk' class='placeholder-trunk'>Trunk</a></li>
                <li><a href='#editor-treemeasurement-crown' class='placeholder-crown'>Crown</a></li>
                <li><a href='#editor-treemeasurement-misc' class='placeholder-misc'>Misc</a></li>
            </ul>
            <div id='editor-treemeasurement-general' class='placeholder-general'>
                <div class="ui-form-row common-name">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CommonName)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CommonName)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CommonName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CommonName, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row scientific-name">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.ScientificName)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ScientificName)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ScientificName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ScientificName, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row entercoordinates">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CoordinatesEntered)%>
                    <%= Html.CheckBoxFor(m => m.SelectedTreeMeasurement.CoordinatesEntered)%>
                    <a href="javascript:TreeMeasurementEditor.OpenCoordinatePicker(<%= Model.Trip.HasEnteredCoordinates ? "true" : "false" %>)" class="coordinatepicker entercoordinates-visible">Pick coordinates</a>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row entercoordinates-visible latitude">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row entercoordinates-visible longitude">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row enterpublicaccess entercoordinates-visible">
                    <label for="KeepCoordinatesPrivate">Keep private</label>
                    <%= Html.RadioButtonFor(m => m.SelectedTreeMeasurement.MakeCoordinatesPublic, false, new { Id = "KeepCoordinatesPrivate" })%>
                    <label for="MakeCoordinatesPublic">Make public</label>
                    <%= Html.RadioButtonFor(m => m.SelectedTreeMeasurement.MakeCoordinatesPublic, true, new { Id = "MakeCoordinatesPublic" })%>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GeneralComments)%>
                    <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.GeneralComments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GeneralComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GeneralComments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </div>
            <div id='editor-treemeasurement-height' class='placeholder-height'>
                <div class="ui-form-row height-simple-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Height)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Height)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Height, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Height, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row height-detailed-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleTop, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row height-detailed-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceTop, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>                
                <div class="ui-form-row height-detailed-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.VerticalOffset, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row height-detailed-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.AngleBottom, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row height-detailed-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.DistanceBottom, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row height-detailed-visible" style="float: left; margin-left: 100px">
                    <a href="javascript:TreeMeasurementEditor.CalculateDetailedHeightMeasurements()" class="height-detailed-calculate">Calculate height and offset</a>
                </div>
                <div class="ui-form-row height-detailed-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height, new { disabled = true })%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Height, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row height-detailed-visible">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset, new { disabled = true })%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurements.Offset, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row height-detailed" style="float: left; margin-left: 100px">
                    <label for="treemeasurement-simpleheight" style="width: 105px;">Simple height</label>
                    <%= Html.RadioButtonFor(m => m.SelectedTreeMeasurement.SimpleHeightMeasurements, true, new { Id = "treemeasurement-simpleheight" })%>
                    <label for="treemeasurement-detailedheight" style="width: 105px;">Detailed height</label>
                    <%= Html.RadioButtonFor(m => m.SelectedTreeMeasurement.SimpleHeightMeasurements, false, new { Id = "treemeasurement-detailedheight" })%>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.BaseCrownHeight)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.BaseCrownHeight)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.BaseCrownHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.BaseCrownHeight, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurementType)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurementType)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurementType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurementType, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.LaserBrand)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LaserBrand)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LaserBrand, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LaserBrand, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ClinometerBrand, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ClinometerBrand, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightComments)%>
                    <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.HeightComments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightComments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </div>
            <div id='editor-treemeasurement-girth' class='placeholder-girth'>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthBreastHeight)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthBreastHeight)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthBreastHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthBreastHeight, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthComments)%>
                    <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.GirthComments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthComments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </div>
            <div id='editor-treemeasurement-trunk' class='placeholder-trunk'>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.NumberOfTrunks)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.NumberOfTrunks)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.NumberOfTrunks, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.NumberOfTrunks, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolume)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolume)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolume, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolume, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkComments)%>
                    <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TrunkComments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkComments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.FormType)%>
                    <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.FormType, ModelExtensions.BuildSelectList<TreeFormType>())%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.FormType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.FormType, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TreeFormComments)%>
                    <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TreeFormComments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeFormComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeFormComments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </div>
            <div id='editor-treemeasurement-crown' class='placeholder-crown'>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.MaximumCrownSpread)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.MaximumCrownSpread)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumCrownSpread, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumCrownSpread, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.AverageCrownSpread)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.AverageCrownSpread)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AverageCrownSpread, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AverageCrownSpread, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.MaximumLimbLength)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.MaximumLimbLength)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumLimbLength, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumLimbLength, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownVolume)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownVolume)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolume, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolume, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownComments)%>
                    <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.CrownComments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownComments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </div>
            <div id='editor-treemeasurement-status' class='placeholder-status'>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeClass)%>
                    <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeClass, ModelExtensions.BuildSelectList<TreeAgeClass>())%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeClass, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeClass, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Age)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Age)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Age, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Age, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeType)%>
                    <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeType, ModelExtensions.BuildSelectList<TreeAgeType>())%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeType, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Status)%>
                    <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.Status, ModelExtensions.BuildSelectList<TreeStatus>())%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Status, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Status, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.HealthStatus)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HealthStatus)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HealthStatus, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HealthStatus, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </div>
            <div id='editor-treemeasurement-misc' class='placeholder-misc'>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.Elevation)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Elevation)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Elevation, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Elevation, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainType)%>
                    <%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.TerrainType, ModelExtensions.BuildSelectList<TreeTerrainType>())%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainType, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainType, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.LandformIndex)%>
                    <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LandformIndex)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LandformIndex, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LandformIndex, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
                <div class="ui-form-row">
                    <%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainComments)%>
                    <%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TerrainComments)%>
                    <div class="ui-validation-error ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainComments, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainComments, "", new { @class = "ui-validation-error-message" })%>
                    </div>
                    <div class="ui-helper-clearfix"></div>
                </div>
            </div>
        </div>
    </form>
</div>
