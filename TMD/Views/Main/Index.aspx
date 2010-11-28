﻿<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>

<asp:Content ContentPlaceHolderID="Content" runat="server">
    <div class="portlet x6">
		<div class="portlet-header"><h4>Welcome</h4></div>
		<div class="portlet-content">
            <p>
                The Trees Database is an experimental project by Steve and Mitch Galehouse, with utilization by the <a href="http://www.nativetreesociety.org/">Eastern Native Tree Society</a> in mind.
            </p>
            <p>
                This site allows you to review, search, sort, add, and download information concerning native(and exotic) tree species, including height, girth dimension, geographic location, and site specifics. 
                The intent is to include as many tree species from as many locations as possible to make it possible to compare tree species' size potentials across their native ranges.
            </p>
		</div>
	</div>
	
	
	<div class="portlet x6">
		<div class="portlet-header"><h4>Images</h4></div>
		<div class="portlet-content">
            <ul class="gallery">
                <li>
                    <img alt="White oak in fog" src="/images/white oak in fog_small.jpg"/>    
                    <div class="actions">
                        <a  class="btn btn-orange btn-small" rel="facebox" href="/images/white oak in fog.jpg">View</a>
                    </div>
                </li>
            </ul>
		</div>
	</div>

    <div class="xbreak"></div> <!-- .xbreak -->

    <div class="portlet x3">
		<div class="portlet-header"><h4>Import</h4></div>		
		<div class="portlet-content">
            <p>
                Add your tree data to the site using this page. Several formats for importing are functional, with more to follow.
            </p>
		</div>
	</div>

    <div class="portlet x3">
		<div class="portlet-header"><h4>Map</h4></div>
		<div class="portlet-content">
            <p>
                View trees and site locations on Google Maps.
            </p>
		</div>
	</div>

    <div class="portlet x3">
		<div class="portlet-header"><h4>Browse</h4></div>
		<div class="portlet-content">
            <p>
                Review data using several functions.
            </p>
		</div>
	</div>

    <div class="portlet x3">
		<div class="portlet-header"><h4>Export</h4></div>
		<div class="portlet-content">
            <p>
                Download data to your computer.
            </p>
		</div>
	</div>

</asp:Content>