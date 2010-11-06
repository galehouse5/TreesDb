<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>Incompatible Browser</title>
    <link rel="shortcut icon" href="/Images/favicon.ico" />
    <link type="text/css" rel="stylesheet" href="/Styles/Common.css" />
</head>
<body>
    <div class="ui-header">
        <div class="ui-header-logo">
            <a href="/">
                <img src="/Images/ui-logo-main.png" alt="logo" />
            </a>
        </div>
    </div>
    <div class="ui-content EmphasizeContent" >
        <h2>Your web browser is untested</h2>
        <p>
            Sorry but your web browser hasn't been tested for compatibility with the Tree Measurement Database yet.  
            Please switch to one of the following browsers before trying to use the Tree Measurement Database.
        </p>
        <ul>
            <li><b>Firefox 3 (recommended)</b> - <a href="http://www.mozilla.com/en-US/products/download.html">download here</a></li>
            <li>Internet Explorer 8 - <a href="http://www.microsoft.com/windows/internet-explorer/default.aspx">download here</a></li>
        </ul>
        <% using(Html.BeginForm("BypassBrowserCheck", "Error")) { %>
            <%= Html.Hidden("ReturnUrl", Url.RequestContext.HttpContext.Request.RawUrl) %>
            <button type="submit">Ignore this warning and continue anyway (not recommended)</button>
        <% } %>
    </div>
</body>
</html>
