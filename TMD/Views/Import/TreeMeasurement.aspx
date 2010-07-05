<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<div class="accordion">
    <h3 class="general-placeholder">
        <a href="#">1. Enter general information <%= Html.ValidationMessage("SelectedTreeMeasurement.General.HasErrors", "...") %></a>
    </h3>
    <div class="general-placeholder">
        <form method="post" action="">
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.CommonName)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.CommonName)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.CommonName)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.ScientificName)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ScientificName)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ScientificName)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Measured)%></div>
                <div class="form-col-normal"><%= Html.EditorFor(m => m.SelectedTreeMeasurement.Measured, new { @class = "date" })%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Measured)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Status)%></div>
                <div class="form-col-normal"><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.Status, ModelExtensions.BuildSelectList<TreeStatus>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Status)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.HealthStatus)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.HealthStatus)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.HealthStatus)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeClass)%></div>
                <div class="form-col-normal"><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeClass, ModelExtensions.BuildSelectList<TreeAgeClass>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeClass)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.AgeType)%></div>
                <div class="form-col-normal"><%= Html.DropDownListFor(m => m.SelectedTreeMeasurement.AgeType, ModelExtensions.BuildSelectList<TreeAgeType>())%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.AgeType)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.Age)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.Age)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.Age)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.GeneralComments)%></div>
                <div class="form-col-normal"><%= Html.TextAreaFor(m => m.SelectedTreeMeasurement.GeneralComments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.GeneralComments)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
        </form>
    </div>
    <h3 class="heightandgirth-placeholder">
        <a href="#">2. Enter height and girth information <%= Html.ValidationMessage("SelectedTreeMeasurement.HeightAndGirth.HasErrors", "...")%></a>
    </h3>
    <div class="heightandgirth-placeholder"> 
        <form method="post" action="">
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.LaserBrand)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LaserBrand)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LaserBrand)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.ClinometerBrand)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>  
        </form>
    </div>
    <h3 class="trunkandcrown-placeholder">
        <a href="#">3. Enter trunk and crown information <%= Html.ValidationMessage("SelectedTreeMeasurement.TrunkAndCrown.HasErrors", "...")%></a>
    </h3>
    <div class="trunkandcrown-placeholder"> 
        <form method="post" action="">
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
        </form>
    </div>
    <h3 class="misc-placeholder">
        <a href="#">4. Enter misc information <%= Html.ValidationMessage("SelectedTreeMeasurement.Misc.HasErrors", "...")%></a>
    </h3>
    <div class="misc-placeholder"> 
        <form method="post" action="">
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TerrainShapeIndex)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.LandformIndex)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.LandformIndex)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.LandformIndex)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>  
        </form>
    </div>
</div>
        
