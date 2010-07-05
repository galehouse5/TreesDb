<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class="accordion">
    <form method="post" action="">
        <h3 class="general-placeholder">
            <a href="#">1. Enter general information <%= Html.ValidationMessage("SelectedTreeMeasurement.General.HasErrors", "...") %></a>
        </h3>
        <div class="general-placeholder">
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
        </div>
        <h3 class="heightandgirth-placeholder">
            <a href="#">2. Enter height and girth information <%= Html.ValidationMessage("SelectedSiteVisit.HeightAndGirth.HasErrors", "...") %></a>
        </h3>
        <div class="heightandgirth-placeholder"> 
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
        </div>
        <h3 class="trunkandcrown-placeholder">
            <a href="#">3. Enter trunk and crown information <%= Html.ValidationMessage("SelectedSiteVisit.TrunkAndCrown.HasErrors", "...") %></a>
        </h3>
        <div class="trunkandcrown-placeholder"> 
            <div class="form-row">
                <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%></div>
                <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%><%= Html.ValidationMessageFor(m => m.SelectedTreeMeasurement.TrunkVolumeCalculationMethod)%></div>
                <div class="ui-helper-clearfix"></div>
            </div>
        </div>
        <h3 class="misc-placeholder">
            <a href="#">4. Enter misc information <%= Html.ValidationMessage("SelectedSiteVisit.Misc.HasErrors", "...") %></a>
        </h3>
        <div class="misc-placeholder"> 
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
        </div>
    </form>
</div>
        
