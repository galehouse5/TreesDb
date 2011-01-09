<%@ Page Title="Import View" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="ViewPageBase<ImportFinishedTripModel>" %>
<%@ Import Namespace="TMD.Model.Imports" %>

<asp:Content ID="Content2" ContentPlaceHolderID="Styles" runat="server">
    <link rel="stylesheet" href="/css/Import.css" type="text/css" />	
</asp:Content>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="portlet x12">
        <div class="portlet-header">
            <h4>Viewing trip</h4>
        </div>
        <div class="portlet-content">
            <%= Html.DisplayFor(m => m, "FinishedTrip") %>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript" src="/js/Import/Trips.js"></script>
    <script type="text/javascript">
        $(function () { $('body').InitializeTripsUi(); });
    </script>
</asp:Content>
