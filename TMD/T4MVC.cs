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
public static class Mvc {
    public static TMD.Controllers.AccountController Account = new TMD.Controllers.T4MVC_AccountController();
    public static TMD.Controllers.BrowseController Browse = new TMD.Controllers.T4MVC_BrowseController();
    public static TMD.Controllers.ErrorController Error = new TMD.Controllers.T4MVC_ErrorController();
    public static TMD.Controllers.ExportController Export = new TMD.Controllers.T4MVC_ExportController();
    public static TMD.Controllers.ImportController Import = new TMD.Controllers.T4MVC_ImportController();
    public static TMD.Controllers.MainController Main = new TMD.Controllers.T4MVC_MainController();
    public static TMD.Controllers.MapController Map = new TMD.Controllers.T4MVC_MapController();
    public static TMD.Controllers.PhotosController Photos = new TMD.Controllers.T4MVC_PhotosController();
    public static TMD.Controllers.TreesController Trees = new TMD.Controllers.T4MVC_TreesController();
    public static T4MVC.SharedController Shared = new T4MVC.SharedController();
}

namespace T4MVC {
}

namespace System.Web.Mvc {
    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public static class T4Extensions {
        public static MvcHtmlString ActionLink(this HtmlHelper htmlHelper, string linkText, ActionResult result) {
            return htmlHelper.RouteLink(linkText, result.GetRouteValueDictionary());
        }

        public static MvcHtmlString ActionLink(this HtmlHelper htmlHelper, string linkText, ActionResult result, object htmlAttributes) {
            return ActionLink(htmlHelper, linkText, result, new RouteValueDictionary(htmlAttributes));
        }

        public static MvcHtmlString ActionLink(this HtmlHelper htmlHelper, string linkText, ActionResult result, IDictionary<string, object> htmlAttributes) {
            return htmlHelper.RouteLink(linkText, result.GetRouteValueDictionary(), htmlAttributes);
        }

        public static MvcForm BeginForm(this HtmlHelper htmlHelper, ActionResult result) {
            return htmlHelper.BeginForm(result, FormMethod.Post);
        }

        public static MvcForm BeginForm(this HtmlHelper htmlHelper, ActionResult result, FormMethod formMethod) {
            return htmlHelper.BeginForm(result, formMethod, null);
        }

        public static MvcForm BeginForm(this HtmlHelper htmlHelper, ActionResult result, FormMethod formMethod, object htmlAttributes) {
            return BeginForm(htmlHelper, result, formMethod, new RouteValueDictionary(htmlAttributes));
        }

        public static MvcForm BeginForm(this HtmlHelper htmlHelper, ActionResult result, FormMethod formMethod, IDictionary<string, object> htmlAttributes) {
            var callInfo = result.GetT4MVCResult();
            return htmlHelper.BeginForm(callInfo.Action, callInfo.Controller, callInfo.RouteValueDictionary, formMethod, htmlAttributes);
        }

        public static void RenderAction(this HtmlHelper htmlHelper, ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            htmlHelper.RenderAction(callInfo.Action, callInfo.Controller, callInfo.RouteValueDictionary);
        }

        public static MvcHtmlString Action(this HtmlHelper htmlHelper, ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return htmlHelper.Action(callInfo.Action, callInfo.Controller, callInfo.RouteValueDictionary);
        }
        public static string Action(this UrlHelper urlHelper, ActionResult result) {
            return urlHelper.RouteUrl(result.GetRouteValueDictionary());
        }

        public static string ActionAbsolute(this UrlHelper urlHelper, ActionResult result) {
            return string.Format("{0}{1}",urlHelper.RequestContext.HttpContext.Request.Url.GetLeftPart(UriPartial.Authority),
                urlHelper.RouteUrl(result.GetRouteValueDictionary()));
        }

        public static MvcHtmlString ActionLink(this AjaxHelper ajaxHelper, string linkText, ActionResult result, AjaxOptions ajaxOptions) {
            return ajaxHelper.RouteLink(linkText, result.GetRouteValueDictionary(), ajaxOptions);
        }

        public static MvcHtmlString ActionLink(this AjaxHelper ajaxHelper, string linkText, ActionResult result, AjaxOptions ajaxOptions, object htmlAttributes) {
            return ajaxHelper.RouteLink(linkText, result.GetRouteValueDictionary(), ajaxOptions, new RouteValueDictionary(htmlAttributes));
        }

        public static MvcHtmlString ActionLink(this AjaxHelper ajaxHelper, string linkText, ActionResult result, AjaxOptions ajaxOptions, IDictionary<string, object> htmlAttributes) {
            return ajaxHelper.RouteLink(linkText, result.GetRouteValueDictionary(), ajaxOptions, htmlAttributes);
        }

        public static MvcForm BeginForm(this AjaxHelper ajaxHelper, ActionResult result, AjaxOptions ajaxOptions) {
            return ajaxHelper.BeginForm(result, ajaxOptions, null);
        }

        public static MvcForm BeginForm(this AjaxHelper ajaxHelper, ActionResult result, AjaxOptions ajaxOptions, object htmlAttributes) {
            return BeginForm(ajaxHelper, result, ajaxOptions, new RouteValueDictionary(htmlAttributes));
        }

        public static MvcForm BeginForm(this AjaxHelper ajaxHelper, ActionResult result, AjaxOptions ajaxOptions, IDictionary<string, object> htmlAttributes) {
            var callInfo = result.GetT4MVCResult();
            return ajaxHelper.BeginForm(callInfo.Action, callInfo.Controller, callInfo.RouteValueDictionary, ajaxOptions, htmlAttributes);
        }

        public static Route MapRoute(this RouteCollection routes, string name, string url, ActionResult result) {
            return MapRoute(routes, name, url, result, null /*namespaces*/);
        }

        public static Route MapRoute(this RouteCollection routes, string name, string url, ActionResult result, object defaults) {
            return MapRoute(routes, name, url, result, defaults, null /*constraints*/, null /*namespaces*/);
        }

        public static Route MapRoute(this RouteCollection routes, string name, string url, ActionResult result, string[] namespaces) {
            return MapRoute(routes, name, url, result, null /*defaults*/, namespaces);
        }

        public static Route MapRoute(this RouteCollection routes, string name, string url, ActionResult result, object defaults, object constraints) {
            return MapRoute(routes, name, url, result, defaults, constraints, null /*namespaces*/);
        }

        public static Route MapRoute(this RouteCollection routes, string name, string url, ActionResult result, object defaults, string[] namespaces) {
            return MapRoute(routes, name, url, result, defaults, null /*constraints*/, namespaces);
        }

        public static Route MapRoute(this RouteCollection routes, string name, string url, ActionResult result, object defaults, object constraints, string[] namespaces) {
            // Create and add the route
            var route = CreateRoute(url, result, defaults, constraints, namespaces);
            routes.Add(name, route);
            return route;
        }

        // Note: can't name the AreaRegistrationContext methods 'MapRoute', as that conflicts with the existing methods
        public static Route MapRouteArea(this AreaRegistrationContext context, string name, string url, ActionResult result) {
            return MapRouteArea(context, name, url, result, null /*namespaces*/);
        }

        public static Route MapRouteArea(this AreaRegistrationContext context, string name, string url, ActionResult result, object defaults) {
            return MapRouteArea(context, name, url, result, defaults, null /*constraints*/, null /*namespaces*/);
        }

        public static Route MapRouteArea(this AreaRegistrationContext context, string name, string url, ActionResult result, string[] namespaces) {
            return MapRouteArea(context, name, url, result, null /*defaults*/, namespaces);
        }

        public static Route MapRouteArea(this AreaRegistrationContext context, string name, string url, ActionResult result, object defaults, object constraints) {
            return MapRouteArea(context, name, url, result, defaults, constraints, null /*namespaces*/);
        }

        public static Route MapRouteArea(this AreaRegistrationContext context, string name, string url, ActionResult result, object defaults, string[] namespaces) {
            return MapRouteArea(context, name, url, result, defaults, null /*constraints*/, namespaces);
        }

        public static Route MapRouteArea(this AreaRegistrationContext context, string name, string url, ActionResult result, object defaults, object constraints, string[] namespaces) {
            // Create and add the route
            if ((namespaces == null) && (context.Namespaces != null)) {
                 namespaces = context.Namespaces.ToArray();
            }
            var route = CreateRoute(url, result, defaults, constraints, namespaces);
            context.Routes.Add(name, route);
            route.DataTokens["area"] = context.AreaName;
            bool useNamespaceFallback = (namespaces == null) || (namespaces.Length == 0);
            route.DataTokens["UseNamespaceFallback"] = useNamespaceFallback;
            return route;
        }

        private static Route CreateRoute(string url, ActionResult result, object defaults, object constraints, string[] namespaces) {
            // Start by adding the default values from the anonymous object (if any)
            var routeValues = new RouteValueDictionary(defaults);

            // Then add the Controller/Action names and the parameters from the call
            foreach (var pair in result.GetRouteValueDictionary()) {
                routeValues.Add(pair.Key, pair.Value);
            }

            var routeConstraints = new RouteValueDictionary(constraints);

            // Create and add the route
            var route = new Route(url, routeValues, routeConstraints, new MvcRouteHandler());

            route.DataTokens = new RouteValueDictionary();

            if (namespaces != null && namespaces.Length > 0) {
                route.DataTokens["Namespaces"] = namespaces;
            }

            return route;
        }

        public static IT4MVCActionResult GetT4MVCResult(this ActionResult result) {
            var t4MVCResult = result as IT4MVCActionResult;
            if (t4MVCResult == null) {
                throw new InvalidOperationException("T4MVC was called incorrectly. You may need to force it to regenerate by right clicking on T4MVC.tt and choosing Run Custom Tool");
            }
            return t4MVCResult;
        }

        public static RouteValueDictionary GetRouteValueDictionary(this ActionResult result) {
            return result.GetT4MVCResult().RouteValueDictionary;
        }

        public static ActionResult AddRouteValues(this ActionResult result, object routeValues) {
            return result.AddRouteValues(new RouteValueDictionary(routeValues));
        }

        public static ActionResult AddRouteValues(this ActionResult result, RouteValueDictionary routeValues) {
            RouteValueDictionary currentRouteValues = result.GetRouteValueDictionary();

            // Add all the extra values
            foreach (var pair in routeValues) {
                currentRouteValues.Add(pair.Key, pair.Value);
            }

            return result;
        }

        public static ActionResult AddRouteValues(this ActionResult result, System.Collections.Specialized.NameValueCollection nameValueCollection) {
            // Copy all the values from the NameValueCollection into the route dictionary
            nameValueCollection.CopyTo(result.GetRouteValueDictionary());
            return result;
        }

        public static ActionResult AddRouteValue(this ActionResult result, string name, object value) {
            RouteValueDictionary routeValues = result.GetRouteValueDictionary();
            routeValues.Add(name, value);
            return result;
        }
        
        public static void InitMVCT4Result(this IT4MVCActionResult result, string area, string controller, string action) {
            result.Controller = controller;
            result.Action = action;
            result.RouteValueDictionary = new RouteValueDictionary();
             
            result.RouteValueDictionary.Add("Controller", controller);
            result.RouteValueDictionary.Add("Action", action);
        }

        public static bool FileExists(string virtualPath) {
            if (!HostingEnvironment.IsHosted) return false;
            string filePath = HostingEnvironment.MapPath(virtualPath);
            return System.IO.File.Exists(filePath);
        }

        static DateTime CenturyBegin=new DateTime(2001,1,1);
        public static string TimestampString(string virtualPath) {
            if (!HostingEnvironment.IsHosted) return string.Empty;
            string filePath = HostingEnvironment.MapPath(virtualPath);
            return Convert.ToString((System.IO.File.GetLastWriteTimeUtc(filePath).Ticks-CenturyBegin.Ticks)/1000000000,16);            
        }
    }
}

   
[GeneratedCode("T4MVC", "2.0")]   
public interface IT4MVCActionResult {   
    string Action { get; set; }   
    string Controller { get; set; }   
    RouteValueDictionary RouteValueDictionary { get; set; }   
}   
  

[GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
public class T4MVC_ActionResult : System.Web.Mvc.ActionResult, IT4MVCActionResult {
    public T4MVC_ActionResult(string area, string controller, string action): base()  {
        this.InitMVCT4Result(area, controller, action);
    }
     
    public override void ExecuteResult(System.Web.Mvc.ControllerContext context) { }
    
    public string Controller { get; set; }
    public string Action { get; set; }
    public RouteValueDictionary RouteValueDictionary { get; set; }
}



namespace Links {
    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public static class css {
        private const string URLPATH = "~/css";
        public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
        public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
        public static readonly string Css_chirp_config = Url("Css.chirp.config");
        public static readonly string LoginOnly_css = Url("LoginOnly.css");
        public static readonly string LoginOnly_min_css = Url("LoginOnly.min.css");
        public static readonly string Shared_css = Url("Shared.css");
        public static readonly string Shared_min_css = Url("Shared.min.css");
        public static readonly string custom_css = Url("custom.css");
        public static readonly string Import_css = Url("Import.css");
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
        
            public static readonly string jquery_ui_1_8_7_custom_css = Url("jquery-ui-1.8.7.custom.css");
        }
    
        public static readonly string login_css = Url("login.css");
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class plugin {
            private const string URLPATH = "~/css/plugin";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string dataTables_css = Url("dataTables.css");
            public static readonly string facebox_css = Url("facebox.css");
            public static readonly string jquery_visualize_css = Url("jquery.visualize.css");
            public static readonly string tipsy_css = Url("tipsy.css");
            public static readonly string uniform_default_css = Url("uniform.default.css");
        }
    
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class screen {
            private const string URLPATH = "~/css/screen";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string buttons_css = Url("buttons.css");
            public static readonly string layout_css = Url("layout.css");
            public static readonly string mega_css = Url("mega.css");
            public static readonly string reset_css = Url("reset.css");
            public static readonly string text_css = Url("text.css");
            public static readonly string xGrid_css = Url("xGrid.css");
        }
    
        public static readonly string screen_css = Url("screen.css");
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class Theme {
            private const string URLPATH = "~/css/Theme";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string Login_css = Url("Login.css");
            public static readonly string Plugin_css = Url("Plugin.css");
            public static readonly string Screen_css = Url("Screen.css");
            public static readonly string Shared_css = Url("Shared.css");
        }
    
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
            public static readonly string title_png = Url("title.png");
        }
    
        public static readonly string tipsy_gif = Url("tipsy.gif");
        public static readonly string title_png = Url("title.png");
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
    
        public static readonly string Javascript_chirp_config = Url("Javascript.chirp.config");
        public static readonly string Import_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Import.min.js") ? Url("Import.min.js") : Url("Import.js");
                      
        public static readonly string Import_min_js = Url("Import.min.js");
        public static readonly string Map_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Map.min.js") ? Url("Map.min.js") : Url("Map.js");
                      
        public static readonly string Map_min_js = Url("Map.min.js");
        public static readonly string Plugins_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Plugins.min.js") ? Url("Plugins.min.js") : Url("Plugins.js");
                      
        public static readonly string Plugins_min_js = Url("Plugins.min.js");
        public static readonly string Shared_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/Shared.min.js") ? Url("Shared.min.js") : Url("Shared.js");
                      
        public static readonly string Shared_min_js = Url("Shared.min.js");
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public static class jquery {
            private const string URLPATH = "~/js/jquery";
            public static string Url() { return T4MVCHelpers.ProcessVirtualPath(URLPATH); }
            public static string Url(string fileName) { return T4MVCHelpers.ProcessVirtualPath(URLPATH + "/" + fileName); }
            public static readonly string facebox_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/facebox.min.js") ? Url("facebox.min.js") : Url("facebox.js");
                          
            public static readonly string jquery_1_4_4_min_js = Url("jquery-1.4.4.min.js");
            public static readonly string jquery_ui_1_8_7_custom_min_js = Url("jquery-ui-1.8.7.custom.min.js");
            public static readonly string jquery_dataTables_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.dataTables.min.js") ? Url("jquery.dataTables.min.js") : Url("jquery.dataTables.js");
                          
            public static readonly string jquery_fieldtag_js = T4MVCHelpers.IsProduction() && T4Extensions.FileExists(URLPATH + "/jquery.fieldtag.min.js") ? Url("jquery.fieldtag.min.js") : Url("jquery.fieldtag.js");
                          
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

}

static class T4MVCHelpers {
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


    // Logic to determine if the app is running in production or dev environment
    public static bool IsProduction() { 
        return (HttpContext.Current != null && !HttpContext.Current.IsDebuggingEnabled); 
    }
}




namespace T4MVC {
    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public class Dummy {
        private Dummy() { }
        public static Dummy Instance = new Dummy();
    }
}

	

#endregion T4MVC
#pragma warning restore 1591


