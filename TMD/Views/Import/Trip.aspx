<%@ Page Title="Import Trip" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="ViewPageBase<ImportEditTripModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="portlet x2">
        <div class="portlet-header">
            <h4>Steps</h4>
        </div>
        <div class="portlet-content">
            <ol>
                <li><%= Html.ActionLink("Start", "Start") %></li>
                <li><strong>> <%= Html.ActionLink("Enter trip", "Trip", new { id = Model.Id }) %> <</strong></li>
                <li>Enter sites</li>
                <li>Enter trees</li>
                <li>Finish</li>
            </ol>
        </div>
    </div>
    <div class="portlet x10">
        <div class="portlet-header">
            <h4>Enter trip</h4>
        </div>
        <div class="portlet-content">
            <% using (Html.BeginForm("Trip", "Import", FormMethod.Post, new { @class = "form stn-form " })) { %>
                <%= Html.EditorFor(m => m.Name, new { required = true }) %>
                <%= Html.EditorFor(m => m.Date, new { required = true }) %>
                <%= Html.EditorFor(m => m.MeasurerContactInfo, new { required = true, rows = 5 })%>
                <%= Html.EditorFor(m => m.MakeMeasurerContactInfoPublic) %>
                <%= Html.EditorFor(m => m.FirstMeasurer, new { required = true, helpText = "Lastname, Firstname" })%>
                <%= Html.EditorFor(m => m.SecondMeasurer, new { helpText = "Lastname, Firstname" })%>
                <%= Html.EditorFor(m => m.ThirdMeasurer, new { helpText = "Lastname, Firstname" })%>
                <%= Html.EditorFor(m => m.Website)%>
                <div class="field">
                    <label>Photos</label>
                    <div><% Html.RenderAction("ThumbnailGalleryWidget", "Photo", new { model = Model.Photos }); %></div>
                </div>
                <div class="buttonrow">
                    <button type="submit" class="btn">Continue</button>
                    <%= Html.ActionLink("Back", "Start", new { Id = Model.Id }, new { @class = "btn btn-orange" }) %>
                </div>
            <% } %>
        </div>
    </div>
</asp:Content>
