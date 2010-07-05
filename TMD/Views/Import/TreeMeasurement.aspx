<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div class="accordion">
    <h3 class="general-placeholder">
        <a href="#">1. Enter general information <%= Html.ValidationMessage("SelectedTreeMeasurement.General.HasErrors", "...") %></a>
    </h3>
    <div class="general-placeholder">
        <form method="post" action="">
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.CommonName)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CommonName)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CommonName)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.ScientificName)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ScientificName)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ScientificName)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="form-row treename-entered-selector">
                Name this tree? <%= Html.CheckBoxFor(m => m.SelectedTreeMeasurement.TreeNameSpecified) %>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="form-row treename-entered-visible">
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TreeName)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TreeName)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeName)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Measured)%></div>
                <div class='input-col'><%= Html.EditorFor(m => m.SelectedTreeMeasurement.Measured, new { @class = "date" })%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measured)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="treemeasurer-placeholder">
                <div class='form-row'>
                    <div class='label-col'>*First measuer:</div>
                    <div class='input-col'>
                        <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Measurers[0].FirstName, new { Title = "First name" })%>
                        <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Measurers[0].LastName, new { Title = "Last name" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                    <% if (Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[0].FirstName) != null
                            || Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[0].LastName) != null) { %>
                        <div class='label-col'>&nbsp;</div>
                        <div class='input-col'>
                            <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[0].FirstName)%>
                            <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[0].LastName)%>
                        </div>
                        <div class='ui-helper-clearfix'></div>
                    <% } %>
                </div>
                <% if (Model.SelectedTreeMeasurement.Measurers.Count > 1) { %>
                <div class='form-row'>
                    <div class='label-col'>*Second measuer:</div>
                    <div class='input-col'>
                        <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Measurers[1].FirstName, new { Title = "First name" })%>
                        <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Measurers[1].LastName, new { Title = "Last name" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                    <% if (Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[1].FirstName) != null
                            || Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[1].LastName) != null) { %>
                        <div class='label-col'>&nbsp;</div>
                        <div class='input-col'>
                            <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[1].FirstName)%>
                            <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[1].LastName)%>
                        </div>
                        <div class='ui-helper-clearfix'></div>
                    <% } %>
                </div>
                <% } %>
                <% if (Model.SelectedTreeMeasurement.Measurers.Count > 2) { %>
                <div class='form-row'>
                    <div class='label-col'>*Third measuer:</div>
                    <div class='input-col'>
                        <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Measurers[2].FirstName, new { Title = "First name" })%>
                        <%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Measurers[2].LastName, new { Title = "Last name" })%>
                    </div>
                    <div class='ui-helper-clearfix'></div>
                    <% if (Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[2].FirstName) != null
                            || Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[2].LastName) != null) { %>
                        <div class='label-col'>&nbsp;</div>
                        <div class='input-col'>
                            <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[2].FirstName)%>
                            <%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measurers[2].LastName)%>
                        </div>
                        <div class='ui-helper-clearfix'></div>
                    <% } %>
                </div>
                <% } %>
                <div class='form-row'>
                    <div class='label-col'>&nbsp;</div>
                    <% if (Model.SelectedTreeMeasurement.Measurers.Count < 3) { %>
                        <div class='label-col'><a href="javascript:TreeMeasurementEditor.AddMeasurer()">Add measurer</a></div>
                    <% } %>
                    <% if (Model.SelectedTreeMeasurement.Measurers.Count > 1) { %>
                        <div class='label-col'><a href="javascript:TreeMeasurementEditor.RemoveMeasurer()">Remove measurer</a></div>
                    <% } %>
                    <div class='ui-helper-clearfix'></div>
                </div>
            </div>
            <div class="form-row coordinates-entered-selector">
                Enter coordinates for this tree? <%= Html.CheckBoxFor(m => m.SelectedTreeMeasurement.CoordinatesEntered)%>
                <span class='coordinates-entered-visible'><a href="javascript:TreeMeasurementEditor.OpenCoordinatePicker()">Use coordinate picker</a></span>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="form-row coordinates-entered-visible">
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Latitude)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="form-row coordinates-entered-visible">
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Coordinates.Longitude)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.GeneralComments)%></div>
                <div class='input-col'><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.GeneralComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GeneralComments)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <%--<div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.GpsDatum)%></div>
                <div class='input-col'><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.GpsDatum, ModelExtensions.BuildSelectList<TreeGpsDatum>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GpsDatum)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.PositionMeasurementType)%></div>
                <div class='input-col'><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.PositionMeasurementType, ModelExtensions.BuildSelectList<TreePositionMeasurementType>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.PositionMeasurementType)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>--%>
        </form>
    </div>
    <h3 class="heightandgirth-placeholder">
        <a href="#">2. Enter height and girth information <%= Html.ValidationMessage("SelectedTreeMeasurement.HeightAndGirth.HasErrors", "...")%></a>
    </h3>
    <div class="heightandgirth-placeholder"> 
        <form method="post" action="">
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Height)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Height)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Height)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'>&nbsp;</div>
                <div class='input-col'><a href="javascript:void()">Enter detailed height and angle measurements</a></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.BaseCrownHeight)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.BaseCrownHeight)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.BaseCrownHeight)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightMeasurementType)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HeightMeasurementType)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightMeasurementType)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.LaserBrand)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LaserBrand)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LaserBrand)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.HeightComments)%></div>
                <div class='input-col'><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.HeightComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HeightComments)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthBreastHeight)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthBreastHeight)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthBreastHeight)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthMeasurementHeight)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthRootCollarHeight)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.GirthComments)%></div>
                <div class='input-col'><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.GirthComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GirthComments)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
        </form>
    </div>
    <h3 class="trunkandcrown-placeholder">
        <a href="#">3. Enter trunk and crown information <%= Html.ValidationMessage("SelectedTreeMeasurement.TrunkAndCrown.HasErrors", "...")%></a>
    </h3>
    <div class="trunkandcrown-placeholder"> 
        <form method="post" action="">
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.NumberOfTrunks)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.NumberOfTrunks)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.NumberOfTrunks)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolume)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolume)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolume)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkComments)%></div>
                <div class='input-col'><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TrunkComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkComments)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.MaximumCrownSpread)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.MaximumCrownSpread)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumCrownSpread)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.AverageCrownSpread)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.AverageCrownSpread)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AverageCrownSpread)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownSpreadMeasurementMethod)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.MaximumLimbLength)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.MaximumLimbLength)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.MaximumLimbLength)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownVolume)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownVolume)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolume)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownVolumeCalculationMethod)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.CrownComments)%></div>
                <div class='input-col'><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.CrownComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CrownComments)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
        </form>
    </div>
    <h3 class="misc-placeholder">
        <a href="#">4. Enter tree form, age, status, terrain, and other information <%= Html.ValidationMessage("SelectedTreeMeasurement.TreeFormAgeStatusTerrainAndOther.HasErrors", "...")%></a>
    </h3>
    <div class="misc-placeholder"> 
        <form method="post" action="">
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.FormType)%></div>
                <div class='input-col'><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.FormType, ModelExtensions.BuildSelectList<TreeFormType>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.FormType)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TreeFormComments)%></div>
                <div class='input-col'><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TreeFormComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TreeFormComments)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Age)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Age)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Age)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeType)%></div>
                <div class='input-col'><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeType, ModelExtensions.BuildSelectList<TreeAgeType>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeType)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeClass)%></div>
                <div class='input-col'><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeClass, ModelExtensions.BuildSelectList<TreeAgeClass>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeClass)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Status)%></div>
                <div class='input-col'><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.Status, ModelExtensions.BuildSelectList<TreeStatus>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Status)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.HealthStatus)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HealthStatus)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HealthStatus)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainType)%></div>
                <div class='input-col'><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.TerrainType, ModelExtensions.BuildSelectList<TreeTerrainType>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainType)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.LandformIndex)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LandformIndex)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LandformIndex)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainComments)%></div>
                <div class='input-col'><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.TerrainComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainComments)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class='form-row'>
                <div class='label-col'><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Elevation)%></div>
                <div class='input-col'><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Elevation)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Elevation)%></div>
                <div class='ui-helper-clearfix'></div>
            </div>
        </form>
    </div>
</div>
