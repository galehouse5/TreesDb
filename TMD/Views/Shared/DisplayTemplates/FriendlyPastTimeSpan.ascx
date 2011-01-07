<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<TimeSpan>" %>
<% 
    if (Model.TotalDays < 1)
    {
        Response.Write("today");
    }
    else if (Model.TotalDays < 2)
    {
        Response.Write("yesterday");
    }
    else if (Model.TotalDays < 3)
    {
        Response.Write("two days ago");
    }
    else if (Model.TotalDays < 4)
    {
        Response.Write("three days ago");
    }
    else if (Model.TotalDays < 8)
    {
        Response.Write("this week");
    }
    else if (Model.TotalDays < 15)
    {
        Response.Write("last week");
    }
    else if (Model.TotalDays < 22)
    {
        Response.Write("two weeks ago");
    }
    else if (Model.TotalDays < 31)
    {
        Response.Write("this month");
    }
    else if (Model.TotalDays < 61)
    {
        Response.Write("last month");
    }
    else if (Model.TotalDays < 91)
    {
        Response.Write("two months ago");
    }
    else if (Model.TotalDays < 121)
    {
        Response.Write("three months ago");
    }
    else if (Model.TotalDays < 151)
    {
        Response.Write("four months ago");
    }
    else if (Model.TotalDays < 181)
    {
        Response.Write("five months ago");
    }
    else if (Model.TotalDays < 221)
    {
        Response.Write("six months ago");
    }
    else if (Model.TotalDays < 366)
    {
        Response.Write("this year");
    }
    else if (Model.TotalDays < 731)
    {
        Response.Write("last year");
    }
    else if (Model.TotalDays < 1096)
    {
        Response.Write("two years ago");
    }
    else if (Model.TotalDays < 1461)
    {
        Response.Write("three years ago");
    }
    else if (Model.TotalDays < 1826)
    {
        Response.Write("four years ago");
    }
    else if (Model.TotalDays < 2191)
    {
        Response.Write("five years ago");
    }
    else if (Model.TotalDays < 2556)
    {
        Response.Write("six years ago");
    }
    else
    {
        Response.Write("over six years ago");
    }
 %>