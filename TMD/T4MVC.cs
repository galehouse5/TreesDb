﻿// <auto-generated />
// This file was generated by a T4 template.
// Don't change it directly as your change would get overwritten.  Instead, make changes
// to the .tt file (i.e. the T4 template) and save it to regenerate this file.

// Make sure the compiler doesn't complain about missing Xml comments
#pragma warning disable 1591
#region T4MVC

using System;
using System.Diagnostics;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using System.Web.Mvc.Html;
using System.Web.Routing;
using T4MVC;

[GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
public static class MVC
{
    public static TMD.Controllers.AccountController Account = new TMD.Controllers.T4MVC_AccountController();
    public static TMD.Controllers.BrowseController Browse = new TMD.Controllers.T4MVC_BrowseController();
    public static TMD.Controllers.ErrorController Error = new TMD.Controllers.T4MVC_ErrorController();
    public static TMD.Controllers.ExportController Export = new TMD.Controllers.T4MVC_ExportController();
    public static TMD.Controllers.ImportController Import = new TMD.Controllers.T4MVC_ImportController();
    public static TMD.Controllers.MainController Main = new TMD.Controllers.T4MVC_MainController();
    public static TMD.Controllers.MapController Map = new TMD.Controllers.T4MVC_MapController();
    public static TMD.Controllers.PhotosController Photos = new TMD.Controllers.T4MVC_PhotosController();
    public static TMD.Controllers.SearchController Search = new TMD.Controllers.T4MVC_SearchController();
    public static TMD.Controllers.TreesController Trees = new TMD.Controllers.T4MVC_TreesController();
    public static T4MVC.SharedController Shared = new T4MVC.SharedController();
}

namespace T4MVC
{
}

namespace T4MVC
{
    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public class Dummy
    {
        private Dummy() { }
        public static Dummy Instance = new Dummy();
    }
}

[GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
internal partial class T4MVC_System_Web_Mvc_ActionResult : System.Web.Mvc.ActionResult, IT4MVCActionResult
{
    public T4MVC_System_Web_Mvc_ActionResult(string area, string controller, string action, string protocol = null): base()
    {
        this.InitMVCT4Result(area, controller, action, protocol);
    }
     
    public override void ExecuteResult(System.Web.Mvc.ControllerContext context) { }
    
    public string Controller { get; set; }
    public string Action { get; set; }
    public string Protocol { get; set; }
    public RouteValueDictionary RouteValueDictionary { get; set; }
}



namespace Links
{
    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public static class css {
        private const string URLPATH = "~/css";
        public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
        public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
        public static readonly string custom_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/custom.min.css") ? Url("custom.min.css") : Url("custom.css");
             
        public static readonly string Import_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Import.min.css") ? Url("Import.min.css") : Url("Import.css");
             
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class jquery {
            private const string URLPATH = "~/css/jquery";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
            public static class images {
                private const string URLPATH = "~/css/jquery/images";
                public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
                public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
                public static readonly string ui_bg_flat_0_000000_40x100_png = Url("ui-bg_flat_0_000000_40x100.png");
                public static readonly string ui_bg_flat_70_ffffff_40x100_png = Url("ui-bg_flat_70_ffffff_40x100.png");
                public static readonly string ui_bg_flat_75_ffffff_40x100_png = Url("ui-bg_flat_75_ffffff_40x100.png");
                public static readonly string ui_bg_glass_0_255648_1x400_png = Url("ui-bg_glass_0_255648_1x400.png");
                public static readonly string ui_bg_glass_15_255648_1x400_png = Url("ui-bg_glass_15_255648_1x400.png");
                public static readonly string ui_bg_glass_55_fbf9ee_1x400_png = Url("ui-bg_glass_55_fbf9ee_1x400.png");
                public static readonly string ui_bg_inset_soft_95_fef1ec_1x100_png = Url("ui-bg_inset-soft_95_fef1ec_1x100.png");
                public static readonly string ui_icons_000000_256x240_png = Url("ui-icons_000000_256x240.png");
                public static readonly string ui_icons_2e83ff_256x240_png = Url("ui-icons_2e83ff_256x240.png");
                public static readonly string ui_icons_cd0a0a_256x240_png = Url("ui-icons_cd0a0a_256x240.png");
                public static readonly string ui_icons_ffffff_256x240_png = Url("ui-icons_ffffff_256x240.png");
            }
        
            public static readonly string jquery_ui_1_8_7_custom_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery-ui-1.8.7.custom.min.css") ? Url("jquery-ui-1.8.7.custom.min.css") : Url("jquery-ui-1.8.7.custom.css");
                 
        }
    
        public static readonly string login_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/login.min.css") ? Url("login.min.css") : Url("login.css");
             
        public static readonly string plugin_dataTables_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/plugin-dataTables.min.css") ? Url("plugin-dataTables.min.css") : Url("plugin-dataTables.css");
             
        public static readonly string plugin_facebox_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/plugin-facebox.min.css") ? Url("plugin-facebox.min.css") : Url("plugin-facebox.css");
             
        public static readonly string plugin_jquery_placeholder_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/plugin-jquery.placeholder.min.css") ? Url("plugin-jquery.placeholder.min.css") : Url("plugin-jquery.placeholder.css");
             
        public static readonly string plugin_jquery_visualize_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/plugin-jquery.visualize.min.css") ? Url("plugin-jquery.visualize.min.css") : Url("plugin-jquery.visualize.css");
             
        public static readonly string plugin_tipsy_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/plugin-tipsy.min.css") ? Url("plugin-tipsy.min.css") : Url("plugin-tipsy.css");
             
        public static readonly string plugin_uniform_default_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/plugin-uniform.default.min.css") ? Url("plugin-uniform.default.min.css") : Url("plugin-uniform.default.css");
             
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class screen {
            private const string URLPATH = "~/css/screen";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string buttons_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/buttons.min.css") ? Url("buttons.min.css") : Url("buttons.css");
                 
            public static readonly string layout_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/layout.min.css") ? Url("layout.min.css") : Url("layout.css");
                 
            public static readonly string mega_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/mega.min.css") ? Url("mega.min.css") : Url("mega.css");
                 
            public static readonly string reset_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/reset.min.css") ? Url("reset.min.css") : Url("reset.css");
                 
            public static readonly string text_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/text.min.css") ? Url("text.min.css") : Url("text.css");
                 
            public static readonly string xGrid_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/xGrid.min.css") ? Url("xGrid.min.css") : Url("xGrid.css");
                 
        }
    
        public static readonly string screen_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/screen.min.css") ? Url("screen.min.css") : Url("screen.css");
             
        public static readonly string theme_login_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/theme-login.min.css") ? Url("theme-login.min.css") : Url("theme-login.css");
             
        public static readonly string theme_plugin_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/theme-plugin.min.css") ? Url("theme-plugin.min.css") : Url("theme-plugin.css");
             
        public static readonly string theme_screen_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/theme-screen.min.css") ? Url("theme-screen.min.css") : Url("theme-screen.css");
             
        public static readonly string theme_shared_css = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/theme-shared.min.css") ? Url("theme-shared.min.css") : Url("theme-shared.css");
             
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public static class js {
        private const string URLPATH = "~/js";
        public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
        public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class Import {
            private const string URLPATH = "~/js/Import";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string Sites_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Sites.min.js") ? Url("Sites.min.js") : Url("Sites.js");
            public static readonly string Trees_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Trees.min.js") ? Url("Trees.min.js") : Url("Trees.js");
        }
    
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class jquery {
            private const string URLPATH = "~/js/jquery";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string facebox_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/facebox.min.js") ? Url("facebox.min.js") : Url("facebox.js");
            public static readonly string jquery_1_4_4_min_js = Url("jquery-1.4.4.min.js");
            public static readonly string jquery_ui_1_8_7_custom_min_js = Url("jquery-ui-1.8.7.custom.min.js");
            public static readonly string jquery_dataTables_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.dataTables.min.js") ? Url("jquery.dataTables.min.js") : Url("jquery.dataTables.js");
            public static readonly string jquery_placeholder_1_1_9_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.placeholder-1.1.9.min.js") ? Url("jquery.placeholder-1.1.9.min.js") : Url("jquery.placeholder-1.1.9.js");
            public static readonly string jquery_quicksearch_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.quicksearch.min.js") ? Url("jquery.quicksearch.min.js") : Url("jquery.quicksearch.js");
            public static readonly string jquery_tablesorter_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.tablesorter.min.js") ? Url("jquery.tablesorter.min.js") : Url("jquery.tablesorter.js");
            public static readonly string jquery_tipsy_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.tipsy.min.js") ? Url("jquery.tipsy.min.js") : Url("jquery.tipsy.js");
            public static readonly string jquery_uniform_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.uniform.min.js") ? Url("jquery.uniform.min.js") : Url("jquery.uniform.js");
            public static readonly string jquery_visualize_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.visualize.min.js") ? Url("jquery.visualize.min.js") : Url("jquery.visualize.js");
        }
    
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class Map {
            private const string URLPATH = "~/js/Map";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string CoordinatePicker_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/CoordinatePicker.min.js") ? Url("CoordinatePicker.min.js") : Url("CoordinatePicker.js");
            public static readonly string Coordinates_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Coordinates.min.js") ? Url("Coordinates.min.js") : Url("Coordinates.js");
            public static readonly string Extensions_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Extensions.min.js") ? Url("Extensions.min.js") : Url("Extensions.js");
            public static readonly string Widgets_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Widgets.min.js") ? Url("Widgets.min.js") : Url("Widgets.js");
        }
    
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class misc {
            private const string URLPATH = "~/js/misc";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string excanvas_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/excanvas.min.js") ? Url("excanvas.min.js") : Url("excanvas.js");
            public static readonly string upclick_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/upclick.min.js") ? Url("upclick.min.js") : Url("upclick.js");
        }
    
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class Search {
            private const string URLPATH = "~/js/Search";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string menu_widget_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/menu-widget.min.js") ? Url("menu-widget.min.js") : Url("menu-widget.js");
        }
    
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class Shared {
            private const string URLPATH = "~/js/Shared";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string Extensions_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Extensions.min.js") ? Url("Extensions.min.js") : Url("Extensions.js");
            public static readonly string Widgets_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Widgets.min.js") ? Url("Widgets.min.js") : Url("Widgets.js");
        }
    
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class slate {
            private const string URLPATH = "~/js/slate";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string slate_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/slate.min.js") ? Url("slate.min.js") : Url("slate.js");
            public static readonly string slate_message_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/slate.message.min.js") ? Url("slate.message.min.js") : Url("slate.message.js");
            public static readonly string slate_portlet_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/slate.portlet.min.js") ? Url("slate.portlet.min.js") : Url("slate.portlet.js");
        }
    
        public static readonly string widgets_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/widgets.min.js") ? Url("widgets.min.js") : Url("widgets.js");
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public static class images {
        private const string URLPATH = "~/images";
        public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
        public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
        public static readonly string accordion_header_png = Url("accordion_header.png");
        public static readonly string amp_btn_icon_sprite_png = Url("amp-btn-icon-sprite.png");
        public static readonly string avatar_jpg = Url("avatar.jpg");
        public static readonly string back_disabled_png = Url("back_disabled.png");
        public static readonly string back_enabled_png = Url("back_enabled.png");
        public static readonly string bg_dark_png = Url("bg-dark.png");
        public static readonly string bg_lite_png = Url("bg-lite.png");
        public static readonly string button_gradient_png = Url("button-gradient.png");
        public static readonly string button_sprite_png = Url("button_sprite.png");
        public static readonly string closelabel_gif = Url("closelabel.gif");
        public static readonly string cross_png = Url("cross.png");
        public static readonly string email_png = Url("email.png");
        public static readonly string forward_disabled_png = Url("forward_disabled.png");
        public static readonly string forward_enabled_png = Url("forward_enabled.png");
        public static readonly string header_bg_png = Url("header_bg.png");
        public static readonly string icon_ico = Url("icon.ico");
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class icons {
            private const string URLPATH = "~/images/icons";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string Calendar_gif = Url("Calendar.gif");
            public static readonly string Map_png = Url("Map.png");
            public static readonly string MultiTrunkTree32_png = Url("MultiTrunkTree32.png");
            public static readonly string SingleTrunkTree32_png = Url("SingleTrunkTree32.png");
            public static readonly string Site32_png = Url("Site32.png");
            public static readonly string Subsite32_png = Url("Subsite32.png");
            public static readonly string Trip32_png = Url("Trip32.png");
        }
    
        public static readonly string link_menu_arrow_png = Url("link-menu-arrow.png");
        public static readonly string loader_gif = Url("loader.gif");
        public static readonly string loading_gif = Url("loading.gif");
        public static readonly string page_white_copy_png = Url("page_white_copy.png");
        public static readonly string page_white_go_png = Url("page_white_go.png");
        public static readonly string pencil_png = Url("pencil.png");
        public static readonly string portlet_header_bg_png = Url("portlet-header-bg.png");
        public static readonly string printer_png = Url("printer.png");
        public static readonly string sort_asc_png = Url("sort_asc.png");
        public static readonly string sort_asc_disabled_png = Url("sort_asc_disabled.png");
        public static readonly string sort_both_png = Url("sort_both.png");
        public static readonly string sort_desc_png = Url("sort_desc.png");
        public static readonly string sort_desc_disabled_png = Url("sort_desc_disabled.png");
        public static readonly string sprite_png = Url("sprite.png");
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class Theme {
            private const string URLPATH = "~/images/Theme";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string accordion_header_png = Url("accordion_header.png");
            public static readonly string back_enabled_png = Url("back_enabled.png");
            public static readonly string button_sprite_png = Url("button_sprite.png");
            public static readonly string forward_enabled_png = Url("forward_enabled.png");
            public static readonly string header_bg_png = Url("header_bg.png");
            public static readonly string icon_png = Url("icon.png");
            public static readonly string title_png = Url("title.png");
        }
    
        public static readonly string tipsy_gif = Url("tipsy.gif");
        public static readonly string title_png = Url("title.png");
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public static partial class Bundles
    {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static partial class Scripts {}
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static partial class Styles {}
    }
}

[GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
internal static class T4MVCHelpers {
    // You can change the ProcessVirtualPath method to modify the path that gets returned to the client.
    // e.g. you can prepend a domain, or append a query string:
    //      return "http://localhost" + path + "?foo=bar";
    private static string ProcessVirtualPathDefault(string virtualPath) {
        // The path that comes in starts with ~/ and must first be made absolute
        string path = VirtualPathUtility.ToAbsolute(virtualPath);
        
        // Add your own modifications here before returning the path
        return path;
    }

    // Calling ProcessVirtualPath through delegate to allow it to be replaced for unit testing
    public static Func<string, string> ProcessVirtualPath = ProcessVirtualPathDefault;

    // Calling T4Extension.TimestampString through delegate to allow it to be replaced for unit testing and other purposes
    public static Func<string, string> TimestampString = System.Web.Mvc.T4Extensions.TimestampString;

    // Logic to determine if the app is running in production or dev environment
    public static bool IsProduction() { 
        return (HttpContext.Current != null && !HttpContext.Current.IsDebuggingEnabled); 
    }
}





#endregion T4MVC
#pragma warning restore 1591


