<%@ Page Title="Tree Measurement Database - Import Trip Info" Language="C#" MasterPageFile="~/TMDWizard.master" AutoEventWireup="true" CodeBehind="ImportTripInfo.aspx.cs" Inherits="TMD.Import.ImportTripInfo" %>
<%@ Register Src="~/Import/ImportSteps.ascx" TagName="ImportSteps" TagPrefix="TMDImport" %>
<%@ Import Namespace="TMD.Application" %>

<asp:Content ID="Content4" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            $("#txtDate").datepicker();

            $('#tripForm').validate({
                rules: {
                    txtName: { required: true }
                },
                messages: {
                    txtName: "hello world"
                }

            });
        });
    </script>
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="overview" runat="server">
    <TMDImport:ImportSteps runat="server" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="step" runat="server">
    <h3>Enter trip information</h3>
    <br />
    <div id="tripForm">
        <div class="form-row">
            <div class="form-col-brief"><label for="txtName">Name:</label></div>
            <div class="form-col-normal"><input type="text" id="txtName" value="<%= ApplicationSession.CurrentImportTrip.Name.ToString() %>" /></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><label for="txtDate">Date:</label></div>
            <div class="form-col-normal"><input type="text" id="txtDate" value="<%= ApplicationSession.CurrentImportTrip.Date.ToString("MM/dd/yyyy") %>" /></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><label for="txtWebsite">Website:</label></div>
            <div class="form-col-normal"><input type="text" id="txtWebsite" value="<%= ApplicationSession.CurrentImportTrip.Website %>" /></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><label for="cbPhotosAvailable">Photos available:</label></div>
            <div class="form-col-normal"><input type="checkbox" id="cbPhotosAvailable" value="<%= ApplicationSession.CurrentImportTrip.PhotosAvailable.ToString() %>" /></div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="form-row">
            <div class="form-col-brief"><label for="txtMeasurerContact">Measurer contact:</label></div>
            <div class="form-col-normal"><input type="text" id="txtMeasurerContact" value="<%= ApplicationSession.CurrentImportTrip.MeasurerContactInfo.ToString() %>" /></div>
            <div class="ui-helper-clearfix"></div>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="nav" runat="server">
    <a href="ImportSiteInfo.aspx">Next ></a>
    <a href="Import.aspx">< Back</a>
</asp:Content>
