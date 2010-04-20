<%@ Page Title="Tree Measurement Database - Import Site Info" Language="C#" MasterPageFile="~/Views/Shared/TMDWizard.Master" Inherits="System.Web.Mvc.ViewPage<TMD.Models.ImportTripModel>" %>
<%@ Import Namespace="TMD.Application" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
<link type="text/css" rel="Stylesheet" href="/Styles/Import.css" />
<script type="text/javascript" src="/Scripts/Import/Common.js"></script>
<script type="text/javascript" src="/Scripts/Import/SitesTreeView.js"></script>
<script type="text/javascript" src="/Scripts/Import/Measurements.js"></script>
<script type="text/javascript">
    $(document).ready(function () {
        $('#measurementsForm').validate();
        $('#SiteList input:hidden').each(function (index, value) {
            $(value).rules("add", { min: 1, messages: { min: "hello world" } });
        });
        $('.wizard a').click(function () {
            if (!$(this).hasClass('advance') || $('#measurementsForm').valid()) {
                return true;
            } else {
                return false;
            }
        });
    });

    

//        $('#SiteList .Site').each(function (index, value) {
//            var siteId = value.id;
//            var siteNumberOfMeasurementsForm = $(value).find('#measurementsForm:' + siteId);
//            InitializeSiteNumberOfMeasurementsFormValidation(siteNumberOfMeasurementsForm, siteId);
//            $(value).find('.Subsite').each(function (index, value) {
//                var subsiteId = value.id;
//                var subsiteNumberOfMeasurementsForm = $(value).find('#measurementsForm:' + siteId);
//                InitializeSubsiteNumberOfMeasurementsFormValidation(siteNumberOfMeasurementsForm, siteId, subsiteId);
//            });
//        });

//        $('.wizard a').click(function () {
//            if (!$(this).hasClass('advance') || $('#sitesForm').valid()) {
//                    return true;
//                } else {
//                    return false;
//                }
//            });
//        });
//    });

//    function validateSitesAndSubsitesNumberOfMeasurements() {
//        var isValid = true;
//        $('#SiteList .Site').each(function (index, value) {
//            var siteId = value.id;
//            var siteNumberOfMeasurementsForm = $(value).find('#measurementsForm:' + siteId);
//            isValid &= siteNumberOfMeasurementsForm.valid();
//            $(value).find('.Subsite').each(function (index, value) {
//                var subsiteId = value.id;
//                var subsiteNumberOfMeasurementsForm = $(value).find('#measurementsForm:' + siteId);
//                InitializeSubsiteNumberOfMeasurementsFormValidation(siteNumberOfMeasurementsForm, siteId, subsiteId);
//            });
//        });
//        return isValid;
//    }
</script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="OverviewContent" runat="server">
<% Html.RenderPartial("Steps"); %>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="StepContent" runat="server">
<h3>Enter measurements</h3>
<div class="sectionspacer"></div>
<p>
    Click Add measurement below each site to build a list of the measurements you recorded on your visit.
    When finished, advance to the final step to review your data and check for errors.
</p>
<form id="measurementsForm" action="">
<% Html.RenderPartial("SitesTreeView"); %>
</form>
<div class="sectionspacer"></div>
</asp:Content>

<asp:Content ID="Content4" ContentPlaceHolderID="NavContent" runat="server">
<%= Html.ActionLink("Next >", "Review", null, new { @class = "advance" })%>
<%= Html.ActionLink("< Back", "SiteInfo", null, new { @class = "retreat" })%>
</asp:Content>
