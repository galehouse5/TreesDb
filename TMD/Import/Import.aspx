<%@ Page Title="Tree Measurement Database - Import Start" Language="C#" MasterPageFile="~/TMDWizard.master" AutoEventWireup="true" CodeBehind="Import.aspx.cs" Inherits="TMD.Import.Import" %>
<%@ Register Src="~/Import/ImportSteps.ascx" TagName="ImportSteps" TagPrefix="TMDImport" %>

<asp:Content ID="Content1" ContentPlaceHolderID="overview" runat="server">
    <TMDImport:ImportSteps runat="server" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="step" runat="server">
    <h3>Before you start</h3>
    <br />
    <p>Please review the list of required information for importing your trip data into the database.  Without this information you will be warned in the review step and forced to go back before completing your import.</p>
    <ul>
        <li>Contact info for the primary measurer on your trip</li>
        <li>Names, counties, states, and ownership info for all visited sites</li>
        <li>Common name, genus, species, and tree form type and number of trunks for all measured trees</li>
        <li>Date of each recorded measurement</li>
        <li>First and last name of all participating measurers</li>
        <li>GPS coordinates either on a site or subsite level or for individual trees</li>
    </ul>
    <br />
    <p>To proceed click the start link in the lower right.</p>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="nav" runat="server">
    <a href="ImportTripInfo.aspx">Start ></a>
</asp:Content>
