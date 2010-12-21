<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<ImportSitesModel>" %>
<%@ Import Namespace="TMD.Model.Trips" %>
<% using (Html.BeginForm("Sites", "Import", FormMethod.Post, new { @class = "form stn-form Sites" })) { %>
    <% for (int i = 0; i < Model.Sites.Count; i++) { %>
        <% if (Model.Sites[i].IsEditing) { %>
            <%= Html.EditorFor(m => m.Sites[i], "Site") %>
        <% } else { %>
            <%= Html.DisplayFor(m => m.Sites[i], "Site") %>
        <% } %>
    <% } %>
    <div class="buttonrow">
        <button type="submit" class="btn" name="innerAction" value="Trip.<%= Model.Id %>.Save">Continue</button>
        <%= Html.ActionLink("Back", "Trip", new { Id = Model.Id }, new { @class = "btn btn-grey" })%>
        <button type="submit" class="btn btn-orange" name="innerAction" value="Trip.<%= Model.Id %>.Add">Add site</button>
    </div>
<% } %>