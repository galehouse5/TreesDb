<%@ Page Title="Import View" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="ViewPageBase<ImportFinishedTripModel>" %>
<%@ Import Namespace="TMD.Model.Imports" %>

<asp:Content ContentPlaceHolderID="Styles" runat="server">
    <%= Html.VersionedLink("/css/Import.css", new { rel = "stylesheet", type = "text/css" })%>
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

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript">
        $(function () { $('body').InitializeTripsUi(); });
    </script>
</asp:Content>
