<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TMD.Model.Trips.Trip>" %>
<div id="TripEditor" class="ui-widget-content ui-corner-all">
    <% using(Html.BeginForm("Edit", "Trip", new { id = Model.Id }, FormMethod.Post)) { %>
        <div class="InputColumn">
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Name) %>
                <%= Html.TextBoxFor(m => m.Name)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Name, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Name, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Date)%>
                <%= Html.EditorFor(m => m.Date)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.Date, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Date, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.Website)%>
                <%= Html.TextBoxFor(m => m.Website)%>
                <div class="ValidationError ">
                    <%= Html.ValidationMessageFor(m => m.Website, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.Website, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.PhotosAvailable)%>
                <%= Html.CheckBoxFor(m => m.PhotosAvailable)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.PhotosAvailable, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.PhotosAvailable, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
        <div class="InputColumn">
            <div class="InputRow">
                <label>*First measuer:</label>
                <%= Html.TextBoxFor(m => m.Measurers[0].FirstName, new { Title = "First name", style = "width: 125px;" })%>
                <%= Html.TextBoxFor(m => m.Measurers[0].LastName, new { Title = "Last name", style = "width: 125px; margin-left: 4px;" })%>
                <% if (Html.ValidationMessageFor(m => m.Measurers[0].FirstName) != null) { %>
                    <div class="ValidationError ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.Measurers[0].FirstName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.Measurers[0].FirstName, "", new { @class = "ValidationErrorMessage" })%>
                    </div>
                <% } %>
                <% if (Html.ValidationMessageFor(m => m.Measurers[0].LastName) != null) { %>
                    <div class="ValidationError ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.Measurers[0].LastName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.Measurers[0].LastName, "", new { @class = "ValidationErrorMessage" })%>
                    </div>
                <% } %>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow">
                <label>Second measuer:</label>
                <%= Html.TextBoxFor(m => m.Measurers[1].FirstName, new { Title = "First name", style = "width: 125px;" })%>
                <%= Html.TextBoxFor(m => m.Measurers[1].LastName, new { Title = "Last name", style = "width: 125px; margin-left: 4px;" })%>
                <% if (Html.ValidationMessageFor(m => m.Measurers[1].FirstName) != null) { %>
                    <div class="ValidationError ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.Measurers[1].FirstName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.Measurers[1].FirstName, "", new { @class = "ValidationErrorMessage" })%>
                    </div>
                <% } %>
                <% if (Html.ValidationMessageFor(m => m.Measurers[1].LastName) != null) { %>
                    <div class="ValidationError ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.Measurers[1].LastName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.Measurers[1].LastName, "", new { @class = "ValidationErrorMessage" })%>
                    </div>
                <% } %>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow">
                <label>Third measuer:</label>
                <%= Html.TextBoxFor(m => m.Measurers[2].FirstName, new { Title = "First name", style = "width: 125px;" })%>
                <%= Html.TextBoxFor(m => m.Measurers[2].LastName, new { Title = "Last name", style = "width: 125px; margin-left: 4px;" })%>
                <% if (Html.ValidationMessageFor(m => m.Measurers[2].FirstName) != null) { %>
                    <div class="ValidationError ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.Measurers[2].FirstName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.Measurers[2].FirstName, "", new { @class = "ValidationErrorMessage" })%>
                    </div>
                <% } %>
                <% if (Html.ValidationMessageFor(m => m.Measurers[2].LastName) != null) { %>
                    <div class="ValidationError ui-state-error-text">
                        <%= Html.ValidationMessageFor(m => m.Measurers[2].LastName, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                        <%= Html.ValidationMessageFor(m => m.Measurers[2].LastName, "", new { @class = "ValidationErrorMessage" })%>
                    </div>
                <% } %>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="InputRow">
                <%= Html.LabelFor(m => m.MeasurerContactInfo)%>
                <%= Html.TextAreaFor(m => m.MeasurerContactInfo)%>
                <div class="ValidationError ui-state-error-text">
                    <%= Html.ValidationMessageFor(m => m.MeasurerContactInfo, " ", new { @class = "ui-icon ui-icon-circle-close" })%>
                    <%= Html.ValidationMessageFor(m => m.MeasurerContactInfo, "", new { @class = "ValidationErrorMessage" })%>
                </div>
                <div class="ui-helper-clearfix"></div>
            </div>
            <div class="InputRow InputButton Buttonset">
                <label for="MakeMeasurerContactInfoPublic">Keep private</label>
                <%= Html.RadioButtonFor(m => m.MakeMeasurerContactInfoPublic, false, new { Id = "MakeMeasurerContactInfoPublic" })%>
                <label for="KeepMeasurerContactInfoPrivate">Make public</label>
                <%= Html.RadioButtonFor(m => m.MakeMeasurerContactInfoPublic, true, new { Id = "KeepMeasurerContactInfoPrivate" })%>
                <div class='ui-helper-clearfix'></div>
            </div>
            <div class="ui-helper-clearfix"></div>
        </div>
    <% } %>
    <div class="ui-helper-clearfix"></div>
</div>

