<%@ Page Title="Tree Measurement Database" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <div class="ui-content-column-one EmphasizeContent">
        <h2>Welcome</h2>
        <p>
            The Tree Measurement Database is an experimental project by Steve and Mitch Galehouse, 
            with utilization by the <a href="http://www.nativetreesociety.org/">Eastern Native Tree Society</a> in mind.
        </p>
        <p>
            This site allows you to review, search, sort, add, and download information concerning native(and exotic) tree species,
            including height, girth dimension, geographic location, and site specifics. The intent is to include as many tree species from
            as many locations as possible to make it possible to compare tree species' size potentials across their native ranges.
        </p>
    </div>
    <div class="ui-content-column-two" style="margin-top: 20px;">
        <img alt="white oak in fog" src="/Images/white oak in fog.jpg" width=340px; />
    </div>
    <div class="ui-content-column-three EmphasizeContent">
        <ul class="ui-content-list">
            <li>
                <h2><a href="/Import">Import</a></h2>
                <p>
                    Add your tree data to the site using this page. Several formats for importing are functional, with more to follow.
                </p>
            </li>
            <li>
                <h2><a href="/Map">Map</a></h2>
                <p>
                    View site locations on Google Maps.
                </p>
            </li>
            <li>
                <h2><a href="/Browse">Browse</a></h2>
                <p>
                    Review data using several functions
                </p>
            </li>
            <li>
                <h2><a href="/Export">Export</a></h2>
                <p>
                    Download data to your computer
                </p>
            </li>
        </ul>
    </div>
    <div class='ui-helper-clearfix'></div>
</asp:Content>
