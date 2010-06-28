<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportModel>" %>
<div class="subsitevisit-placeholder">
    <form method="post" action="">
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.Name)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Name)%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Name)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.State)%></div>
            <div class="form-col-normal"><%= Html.DropDownListFor(m => m.SelectedSubsiteVisit.State, Model.BuildStateSelectList(), new { @class = "subsitevisit-state" })%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.State)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
         <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.County)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.County, new { @class = "subsitevisit-county" })%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.County)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.OwnershipType)%></div>
            <div class="form-col-normal"><%= Html.TextAreaFor(m => m.SelectedSubsiteVisit.OwnershipType, 2, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipType)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-selector">
            Pick rough coordinates for this subsite to simplify remaining steps? <%= Html.CheckBoxFor(m => m.SelectedSubsiteVisit.CoordinatesEntered)%>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-visible">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude, new { @class = "subsitevisit-latitude" })%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Latitude)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-visible">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude)%></div>
            <div class="form-col-normal"><%= Html.TextBoxFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude, new { @class = "subsitevisit-longitude" })%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Coordinates.Longitude)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row coordinates-entered-visible">
            <div class="form-col-brief">&nbsp;</div>
            <div class="form-col-brief"><a href="javascript:SubsiteVisitEditor.OpenCoordinatePicker()">Use coordinate picker</a></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo)%></div>
            <div class="form-col-normal"><%= Html.TextAreaFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo, 2, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.OwnershipContactInfo)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><%= Html.LabelFor(m => m.SelectedSubsiteVisit.Comments)%></div>
            <div class="form-col-normal"><%= Html.TextAreaFor(m => m.SelectedSubsiteVisit.Comments, 4, 50, null)%><%= Html.ValidationMessageFor(m => m.SelectedSubsiteVisit.Comments)%></div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </form>
</div>