<%@ Page Language="C#" MasterPageFile="~/Views/Shared/TMDSite.Master" Inherits="System.Web.Mvc.ViewPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
<div class="content ">
    <div class="content-header">
        Welcome to the <strong>Tree Measurement</strong> Database
        <span class="content-header-description">
            This is an experimental project by Steve and Mitch Galehouse, 
            with utilization by <a href="http://www.nativetreesociety.org/">ENTS</a>, 
            the <a href="http://www.nativetreesociety.org/">Eastern Native Tree Society</a> in mind
        </span>
    </div>
    <div class="content-description">
        <p>
            This site allows you to review, search, sort, add, and download information concerning native(and exotic) tree species,
            including height, girth dimension, geographic location, and site specifics. The intent is to include as many tree species from
            as many locations as possible to make it possible to compare tree species' size potentials across their native ranges.
        </p>
        <div class="panels">
            <div class="panel">
                <ul>
                    <li>
                        <p><a href="/Import">Import</a> - Add your tree data to the site using this page. Several formats for importing are functional, with more to follow</p>
                    </li>
                    <li>
                        <p><a href="/Map">Map</a> - View site locations on Google Maps</p>
                    </li>
                    <li>

                        <p><a href="/Browse">Browse</a> - Review data using several functions</p>
                    </li>
                    <li>
                        <p><a href="/Export">Export</a> - Download data to your computer</p>
                    </li>
                </ul>
            </div>
            <div class="panel">
                <img alt="white oak in fog" src="/Content/white oak in fog.jpg" width="400px" />
            </div>
            <div class='ui-helper-clearfix'></div>
        </div>
    </div>
</div>
</asp:Content>
