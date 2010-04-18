<%@ Page Title="Tree Measurement Database - Import Trip Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import.js"></script>
<script type="text/javascript">
    $(document).ready(function () {
        CreateDatepicker($("#Date"));
        InitializeTripFormValidation($('#tripForm'));
        $('.wizard a').click(function () {
            if ($(this).hasClass('retreat') || $('#tripForm').valid()) {
                var link = $(this);
                $.post('/Import/TripInfo',
                    $('#tripForm').serialize(), 
                    function () {
                        window.location.href = link.attr("href")
                    }
                );
                return false;
            } else {
                return false;
            }
        });
    });
</script>
</asp:Content>

<asp:Content ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ContentPlaceHolderID="StepContent" runat="server">
<h3>Enter trip information</h3>
<div class="sectionspacer"></div>
<form id="tripForm" method="post" action="">
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.Name) %></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.Name)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.Date)%></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.Date)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.Website)%></div>
        <div class="form-col-normal"><%= Html.CustomTextBoxFor(m => m.Website)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.PhotosAvailable)%></div>
        <div class="form-col-normal"><%= Html.CheckBoxFor(m => m.PhotosAvailable)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
    <div class="form-row">
        <div class="form-col-brief"><%= Html.LabelFor(m => m.MeasurerContactInfo)%></div>
        <div class="form-col-normal"><%= Html.CustomTextAreaFor(m => m.MeasurerContactInfo, 4, 50, null)%></div>
        <div class="ui-helper-clearfix"></div>
    </div>
</form>
</asp:Content>

<asp:Content ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "SiteInfo", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "Start", null, new { @class = "retreat" })%>
</asp:Content>
