// <auto-generated />
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
namespace TMD.Controllers {
    public partial class MapController {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public MapController() { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected MapController(Dummy d) { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoute(callInfo.RouteValueDictionary);
        }

        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult MenuWidget() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.MenuWidget);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult SiteViewport() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.SiteViewport);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult SubsiteViewport() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.SubsiteViewport);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult TreeViewport() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.TreeViewport);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult SiteMarkerInfo() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.SiteMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult SubsiteMarkerInfo() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.SubsiteMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult TreeMarkerInfo() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.TreeMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult SiteMarker() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.SiteMarker);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult SubsiteMarker() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.SubsiteMarker);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult TreeMarker() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.TreeMarker);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult ImportSiteMarkers() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.ImportSiteMarkers);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult ImportSubsiteMarkers() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.ImportSubsiteMarkers);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult ImportTreeMarkers() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.ImportTreeMarkers);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult ImportTreeMarkerInfo() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.ImportTreeMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult ImportSiteMarkerInfo() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.ImportSiteMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult ImportSubsiteMarkerInfo() {
            return new T4MVC_ActionResult(Area, Name, ActionNames.ImportSubsiteMarkerInfo);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public MapController Actions { get { return Mvc.Map; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Map";

        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass {
            public readonly string InitializeGoogleMaps = "InitializeGoogleMaps";
            public readonly string MenuWidget = "MenuWidget";
            public readonly string Index = "Index";
            public readonly string SiteViewport = "SiteViewport";
            public readonly string SubsiteViewport = "SubsiteViewport";
            public readonly string TreeViewport = "TreeViewport";
            public readonly string SiteMarkerInfo = "SiteMarkerInfo";
            public readonly string SubsiteMarkerInfo = "SubsiteMarkerInfo";
            public readonly string TreeMarkerInfo = "TreeMarkerInfo";
            public readonly string SiteMarker = "SiteMarker";
            public readonly string SubsiteMarker = "SubsiteMarker";
            public readonly string TreeMarker = "TreeMarker";
            public readonly string AllMarkers = "AllMarkers";
            public readonly string ImportSiteMarkers = "ImportSiteMarkers";
            public readonly string ImportSubsiteMarkers = "ImportSubsiteMarkers";
            public readonly string ImportTreeMarkers = "ImportTreeMarkers";
            public readonly string ImportTreeMarkerInfo = "ImportTreeMarkerInfo";
            public readonly string ImportSiteMarkerInfo = "ImportSiteMarkerInfo";
            public readonly string ImportSubsiteMarkerInfo = "ImportSubsiteMarkerInfo";
        }


        static readonly ViewNames s_views = new ViewNames();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ViewNames Views { get { return s_views; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ViewNames {
            public readonly string ImportSiteMarkerInfo = "~/Views/Map/ImportSiteMarkerInfo.cshtml";
            public readonly string ImportSubsiteMarkerInfo = "~/Views/Map/ImportSubsiteMarkerInfo.cshtml";
            public readonly string ImportTreeMarkerInfo = "~/Views/Map/ImportTreeMarkerInfo.cshtml";
            public readonly string Index = "~/Views/Map/Index.cshtml";
            public readonly string InitializeGoogleMaps = "~/Views/Map/InitializeGoogleMaps.cshtml";
            public readonly string MapViewport = "~/Views/Map/MapViewport.cshtml";
            public readonly string MenuWidget = "~/Views/Map/MenuWidget.cshtml";
            public readonly string SiteMarkerInfo = "~/Views/Map/SiteMarkerInfo.cshtml";
            public readonly string SubsiteMarkerInfo = "~/Views/Map/SubsiteMarkerInfo.cshtml";
            public readonly string TreeMarkerInfo = "~/Views/Map/TreeMarkerInfo.cshtml";
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public class T4MVC_MapController: TMD.Controllers.MapController {
        public T4MVC_MapController() : base(Dummy.Instance) { }

        public override System.Web.Mvc.ActionResult InitializeGoogleMaps() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.InitializeGoogleMaps);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult MenuWidget(bool isSelected) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.MenuWidget);
            callInfo.RouteValueDictionary.Add("isSelected", isSelected);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult Index() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.Index);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SiteViewport(int id) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SiteViewport);
            callInfo.RouteValueDictionary.Add("id", id);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SubsiteViewport(int id, int subsiteId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SubsiteViewport);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("subsiteId", subsiteId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult TreeViewport(int id) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.TreeViewport);
            callInfo.RouteValueDictionary.Add("id", id);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SiteMarkerInfo(int id) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SiteMarkerInfo);
            callInfo.RouteValueDictionary.Add("id", id);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SubsiteMarkerInfo(int id, int subsiteId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SubsiteMarkerInfo);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("subsiteId", subsiteId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult TreeMarkerInfo(int id) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.TreeMarkerInfo);
            callInfo.RouteValueDictionary.Add("id", id);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SiteMarker(int id) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SiteMarker);
            callInfo.RouteValueDictionary.Add("id", id);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult SubsiteMarker(int id, int subsiteId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.SubsiteMarker);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("subsiteId", subsiteId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult TreeMarker(int id) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.TreeMarker);
            callInfo.RouteValueDictionary.Add("id", id);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult AllMarkers() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.AllMarkers);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult ImportSiteMarkers(int id, int siteId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.ImportSiteMarkers);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("siteId", siteId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult ImportSubsiteMarkers(int id, int subsiteId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.ImportSubsiteMarkers);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("subsiteId", subsiteId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult ImportTreeMarkers(int id, int treeId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.ImportTreeMarkers);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("treeId", treeId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult ImportTreeMarkerInfo(int id, int treeId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.ImportTreeMarkerInfo);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("treeId", treeId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult ImportSiteMarkerInfo(int id, int siteId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.ImportSiteMarkerInfo);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("siteId", siteId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult ImportSubsiteMarkerInfo(int id, int subsiteId) {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.ImportSubsiteMarkerInfo);
            callInfo.RouteValueDictionary.Add("id", id);
            callInfo.RouteValueDictionary.Add("subsiteId", subsiteId);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591
