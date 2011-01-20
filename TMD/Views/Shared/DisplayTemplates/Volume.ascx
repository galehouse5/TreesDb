<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Volume>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <% if (!string.IsNullOrWhiteSpace(ViewData["label"].ToString())) { %>
            <%: ViewData["label"] %>:
        <% } %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>:
    <% } %>
</strong>
<% if (ViewData.ContainsKey("empty") && !Model.IsSpecified) { %>
    <%: ViewData["empty"] %>
<% } else if (ViewData.ContainsKey("format")) { %>
    <%: Model.ToString((VolumeFormat)ViewData["format"]) %>
<% } else { %>
    <%: Model %>
<% } %>
