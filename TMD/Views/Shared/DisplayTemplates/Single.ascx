﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Nullable<Single>>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <% if (!string.IsNullOrWhiteSpace(ViewData["label"].ToString())) { %>
            <%: ViewData["label"] %>:
        <% } %>
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>:
    <% } %>
</strong>
<% if (ViewData.ContainsKey("empty") && !Model.HasValue) { %>
    <%: ViewData["empty"] %>
<% } else { %>
    <%: Model %>
<% } %>
