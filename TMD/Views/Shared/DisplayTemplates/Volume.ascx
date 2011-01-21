<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Volume>" %>
<td class="description">
    <% if (ViewData.ContainsKey("label")) { %>
        <% if (!string.IsNullOrWhiteSpace(ViewData["label"].ToString())) { %>
            <%: ViewData["label"] %>
        <% } %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>
    <% } %>
</td>
<td class="value">
    <% if (ViewData.ContainsKey("empty") && !Model.IsSpecified) { %>
        <%: ViewData["empty"] %>
    <% } else if (ViewData.ContainsKey("highlight") && !(bool)ViewData["highlight"]) { %>
        <% if (ViewData.ContainsKey("format")) { %>
            <%: Model.ToString((VolumeFormat)ViewData["format"]) %>
        <% } else { %>
            <%: Model %>
        <% } %>
    <% } else { %>
        <span>
           <% if (ViewData.ContainsKey("format")) { %>
               <%: Model.ToString((VolumeFormat)ViewData["format"]) %>
           <% } else { %>
               <%: Model %>
           <% } %>
        </span>
    <% } %>
</td>
