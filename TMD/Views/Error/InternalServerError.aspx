<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage" %>
<%@ Import Namespace="TMD" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>Server Error</title>
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
        <h2>The server has encountered an error</h2>
        <p>
            Sorry but the server has encountered an error while processing your request.  
            Please try again in a minute or email <a href="mailto:<%= WebApplicationRegistry.Settings.WebmasterEmail %>"><%= WebApplicationRegistry.Settings.WebmasterEmail %></a> if the problem persists.
            To get back to the homepage <a href="/">click here</a>.
        </p>
    </div>
</body>
</html>
