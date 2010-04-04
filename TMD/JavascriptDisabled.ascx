<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="JavascriptDisabled.ascx.cs" Inherits="TMD.JavascriptDisabled" %>
<h2>Javascript Disabled</h2>
<p>
    Sorry, this page requires Javascript. Please see 
    <% if (Request.Browser.Browser.Equals("firefox", StringComparison.CurrentCultureIgnoreCase)) { %>
        <a href="http://support.mozilla.com/en-US/kb/Javascript">this link</a> 
    <% } else if (Request.Browser.Browser.Equals("ie", StringComparison.CurrentCultureIgnoreCase)) { %>
        <a href="http://support.microsoft.com/gp/howtoscript">this link</a> 
    <% } %>
    for instructions to enable Javascript in your browser settings.
</p>