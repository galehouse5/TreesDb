﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Distance>" %>
<strong>
    <% if (ViewData.ContainsKey("label")) { %>
        <%: ViewData["label"] %>:
    <% } else { %>
        <%= Html.GetLabelInnerText(m => m)%>:
    <% } %>
</strong>
<% if (ViewData.ContainsKey("format")) { %>
    <%: Model.ToString((DistanceFormat)ViewData["format"]) %>
<% } else { %>
    <%: Model %>
<% } %>
