<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TimeSpan>" %>
<% if (Model.TotalDays < 1) { %>
    today
<% } else if (Model.TotalDays < 2) { %>
    yesterday
<% } else if (Model.TotalDays < 3) { %>
    two days ago
<% } else if (Model.TotalDays < 4) { %>
    three days ago
<% } else if (Model.TotalDays < 8) { %>
    this week
<% } else if (Model.TotalDays < 15) { %>
    last week
<% } else if (Model.TotalDays < 22) { %>
    two weeks ago
<% } else if (Model.TotalDays < 31) { %>
    this month
<% } else if (Model.TotalDays < 61) { %>
    last month
<% } else if (Model.TotalDays < 91) { %>
    two months ago
<% } else if (Model.TotalDays < 121) { %>
    three months ago
<% } else if (Model.TotalDays < 151) { %>
    four months ago
<% } else if (Model.TotalDays < 181) { %>
    five months ago
<% } else if (Model.TotalDays < 221) { %>
    six months ago
<% } else if (Model.TotalDays < 366) { %>
    this year
<% } else if (Model.TotalDays < 731) { %>
    last year
<% } else if (Model.TotalDays < 1096) { %>
    two years ago
<% } else if (Model.TotalDays < 1461) { %>
    three years ago
<% } else if (Model.TotalDays < 1826) { %>
    four years ago
<% } else if (Model.TotalDays < 2191) { %>
    five years ago
<% } else if (Model.TotalDays < 2556) { %>
    six years ago
<% } else { %>
    over six years ago
<% } %>
