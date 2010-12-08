<%@ Page Title="Incompatible Browser" Language="C#" MasterPageFile="~/Views/Shared/Login.Master" Inherits="System.Web.Mvc.ViewPage" %>
<%@ Import Namespace="TMD" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="content_front">
        <div class="pad">
            <h2>This page is incompatible</h2>
            <p>
                Sorry, this page hasn't been tested for compatibility with your browser.
                The following browsers have been tested compatible:
            </p>
            <ul>
                <li><b><a href="http://www.mozilla.com/en-US/products/download.html">Firefox 3 (recommended)</a></b></li>
                <li><a href="http://www.microsoft.com/windows/internet-explorer/default.aspx">Internet Explorer 8</a></li>
            </ul>
            <p>
                Please contact an administrator or email <a href="mailto:<%= WebApplicationRegistry.Settings.WebmasterEmail %>"><%= WebApplicationRegistry.Settings.WebmasterEmail %></a> to request support for your browser.
            </p>
            <% using(Html.BeginForm("BypassBrowserCheck", "Error")) { %>      
                <%= Html.Hidden("ReturnUrl", Url.RequestContext.HttpContext.Request.RawUrl) %> 
                <div class="field">
			        <span class="label">&nbsp;</span>
			        <div>
                        <button type="submit" class="btn">Continue anyway</button>
                    </div>
		        </div> <!-- .field -->
            <% } %>
        </div>
    </div>
</asp:Content>
