// <auto-generated />
// This file was generated by a T4 template.
// Don't change it directly as your change would get overwritten.  Instead, make changes
// to the .tt file (i.e. the T4 template) and save it to regenerate this file.

// Make sure the compiler doesn't complain about missing Xml comments and CLS compliance
// 0108: suppress "Foo hides inherited member Foo. Use the new keyword if hiding was intended." when a controller and its abstract parent are both processed
// 0114: suppress "Foo.BarController.Baz()' hides inherited member 'Qux.BarController.Baz()'. To make the current member override that implementation, add the override keyword. Otherwise add the new keyword." when an action (with an argument) overrides an action in a parent controller
#pragma warning disable 1591, 3008, 3009, 0108, 0114
#region T4MVC

using System;
using System.Diagnostics;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using System.Web.Mvc.Html;
using System.Web.Routing;
using T4MVC;
namespace TMD.Controllers
{
    public partial class MapController
    {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public MapController() { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected MapController(Dummy d) { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(ActionResult result)
        {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoute(callInfo.RouteValueDictionary);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(Task<ActionResult> taskResult)
        {
            return RedirectToAction(taskResult.Result);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToActionPermanent(ActionResult result)
        {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoutePermanent(callInfo.RouteValueDictionary);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToActionPermanent(Task<ActionResult> taskResult)
        {
            return RedirectToActionPermanent(taskResult.Result);
        }

        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult MenuWidget()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.MenuWidget);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult TreeMarker()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.TreeMarker);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult SiteMarker()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SiteMarker);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult ImportSiteMarkers()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportSiteMarkers);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult ImportTreeMarkers()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportTreeMarkers);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult ImportTreeMarkerInfo()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportTreeMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult ImportSiteMarkerInfo()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportSiteMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult StateMarkerInfo()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.StateMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult SiteMarkerInfo()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SiteMarkerInfo);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult TreeMarkerInfo()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.TreeMarkerInfo);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public MapController Actions { get { return MVC.Map; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Map";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "Map";
        [GeneratedCode("T4MVC", "2.0")]
        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass
        {
            public readonly string MenuWidget = "MenuWidget";
            public readonly string Index = "Index";
            public readonly string AllMarkers = "AllMarkers";
            public readonly string TreeMarker = "TreeMarker";
            public readonly string SiteMarker = "SiteMarker";
            public readonly string ImportSiteMarkers = "ImportSiteMarkers";
            public readonly string ImportTreeMarkers = "ImportTreeMarkers";
            public readonly string ImportTreeMarkerInfo = "ImportTreeMarkerInfo";
            public readonly string ImportSiteMarkerInfo = "ImportSiteMarkerInfo";
            public readonly string StateMarkerInfo = "StateMarkerInfo";
            public readonly string SiteMarkerInfo = "SiteMarkerInfo";
            public readonly string TreeMarkerInfo = "TreeMarkerInfo";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants
        {
            public const string MenuWidget = "MenuWidget";
            public const string Index = "Index";
            public const string AllMarkers = "AllMarkers";
            public const string TreeMarker = "TreeMarker";
            public const string SiteMarker = "SiteMarker";
            public const string ImportSiteMarkers = "ImportSiteMarkers";
            public const string ImportTreeMarkers = "ImportTreeMarkers";
            public const string ImportTreeMarkerInfo = "ImportTreeMarkerInfo";
            public const string ImportSiteMarkerInfo = "ImportSiteMarkerInfo";
            public const string StateMarkerInfo = "StateMarkerInfo";
            public const string SiteMarkerInfo = "SiteMarkerInfo";
            public const string TreeMarkerInfo = "TreeMarkerInfo";
        }


        static readonly ActionParamsClass_MenuWidget s_params_MenuWidget = new ActionParamsClass_MenuWidget();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_MenuWidget MenuWidgetParams { get { return s_params_MenuWidget; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_MenuWidget
        {
            public readonly string isSelected = "isSelected";
        }
        static readonly ActionParamsClass_TreeMarker s_params_TreeMarker = new ActionParamsClass_TreeMarker();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_TreeMarker TreeMarkerParams { get { return s_params_TreeMarker; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_TreeMarker
        {
            public readonly string id = "id";
        }
        static readonly ActionParamsClass_SiteMarker s_params_SiteMarker = new ActionParamsClass_SiteMarker();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_SiteMarker SiteMarkerParams { get { return s_params_SiteMarker; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_SiteMarker
        {
            public readonly string id = "id";
        }
        static readonly ActionParamsClass_ImportSiteMarkers s_params_ImportSiteMarkers = new ActionParamsClass_ImportSiteMarkers();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_ImportSiteMarkers ImportSiteMarkersParams { get { return s_params_ImportSiteMarkers; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_ImportSiteMarkers
        {
            public readonly string id = "id";
            public readonly string siteId = "siteId";
        }
        static readonly ActionParamsClass_ImportTreeMarkers s_params_ImportTreeMarkers = new ActionParamsClass_ImportTreeMarkers();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_ImportTreeMarkers ImportTreeMarkersParams { get { return s_params_ImportTreeMarkers; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_ImportTreeMarkers
        {
            public readonly string id = "id";
            public readonly string treeId = "treeId";
        }
        static readonly ActionParamsClass_ImportTreeMarkerInfo s_params_ImportTreeMarkerInfo = new ActionParamsClass_ImportTreeMarkerInfo();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_ImportTreeMarkerInfo ImportTreeMarkerInfoParams { get { return s_params_ImportTreeMarkerInfo; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_ImportTreeMarkerInfo
        {
            public readonly string id = "id";
            public readonly string treeId = "treeId";
        }
        static readonly ActionParamsClass_ImportSiteMarkerInfo s_params_ImportSiteMarkerInfo = new ActionParamsClass_ImportSiteMarkerInfo();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_ImportSiteMarkerInfo ImportSiteMarkerInfoParams { get { return s_params_ImportSiteMarkerInfo; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_ImportSiteMarkerInfo
        {
            public readonly string id = "id";
            public readonly string siteId = "siteId";
        }
        static readonly ActionParamsClass_StateMarkerInfo s_params_StateMarkerInfo = new ActionParamsClass_StateMarkerInfo();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_StateMarkerInfo StateMarkerInfoParams { get { return s_params_StateMarkerInfo; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_StateMarkerInfo
        {
            public readonly string id = "id";
        }
        static readonly ActionParamsClass_SiteMarkerInfo s_params_SiteMarkerInfo = new ActionParamsClass_SiteMarkerInfo();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_SiteMarkerInfo SiteMarkerInfoParams { get { return s_params_SiteMarkerInfo; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_SiteMarkerInfo
        {
            public readonly string id = "id";
        }
        static readonly ActionParamsClass_TreeMarkerInfo s_params_TreeMarkerInfo = new ActionParamsClass_TreeMarkerInfo();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_TreeMarkerInfo TreeMarkerInfoParams { get { return s_params_TreeMarkerInfo; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_TreeMarkerInfo
        {
            public readonly string id = "id";
        }
        static readonly ViewsClass s_views = new ViewsClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ViewsClass Views { get { return s_views; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ViewsClass
        {
            static readonly _ViewNamesClass s_ViewNames = new _ViewNamesClass();
            public _ViewNamesClass ViewNames { get { return s_ViewNames; } }
            public class _ViewNamesClass
            {
                public readonly string ImportSiteMarkerInfo = "ImportSiteMarkerInfo";
                public readonly string ImportTreeMarkerInfo = "ImportTreeMarkerInfo";
                public readonly string Index = "Index";
                public readonly string MenuWidget = "MenuWidget";
                public readonly string SiteMarkerInfo = "SiteMarkerInfo";
                public readonly string StateMarkerInfo = "StateMarkerInfo";
                public readonly string TreeMarkerInfo = "TreeMarkerInfo";
                public readonly string Web = "Web";
            }
            public readonly string ImportSiteMarkerInfo = "~/Views/Map/ImportSiteMarkerInfo.cshtml";
            public readonly string ImportTreeMarkerInfo = "~/Views/Map/ImportTreeMarkerInfo.cshtml";
            public readonly string Index = "~/Views/Map/Index.cshtml";
            public readonly string MenuWidget = "~/Views/Map/MenuWidget.cshtml";
            public readonly string SiteMarkerInfo = "~/Views/Map/SiteMarkerInfo.cshtml";
            public readonly string StateMarkerInfo = "~/Views/Map/StateMarkerInfo.cshtml";
            public readonly string TreeMarkerInfo = "~/Views/Map/TreeMarkerInfo.cshtml";
            public readonly string Web = "~/Views/Map/Web.config";
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public partial class T4MVC_MapController : TMD.Controllers.MapController
    {
        public T4MVC_MapController() : base(Dummy.Instance) { }

        [NonAction]
        partial void MenuWidgetOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, bool isSelected);

        [NonAction]
        public override System.Web.Mvc.ActionResult MenuWidget(bool isSelected)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.MenuWidget);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "isSelected", isSelected);
            MenuWidgetOverride(callInfo, isSelected);
            return callInfo;
        }

        [NonAction]
        partial void IndexOverride(T4MVC_System_Web_Mvc_ActionResult callInfo);

        [NonAction]
        public override System.Web.Mvc.ActionResult Index()
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Index);
            IndexOverride(callInfo);
            return callInfo;
        }

        [NonAction]
        partial void AllMarkersOverride(T4MVC_System_Web_Mvc_ActionResult callInfo);

        [NonAction]
        public override System.Web.Mvc.ActionResult AllMarkers()
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.AllMarkers);
            AllMarkersOverride(callInfo);
            return callInfo;
        }

        [NonAction]
        partial void TreeMarkerOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        [NonAction]
        public override System.Web.Mvc.ActionResult TreeMarker(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.TreeMarker);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            TreeMarkerOverride(callInfo, id);
            return callInfo;
        }

        [NonAction]
        partial void SiteMarkerOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        [NonAction]
        public override System.Web.Mvc.ActionResult SiteMarker(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SiteMarker);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            SiteMarkerOverride(callInfo, id);
            return callInfo;
        }

        [NonAction]
        partial void ImportSiteMarkersOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int siteId);

        [NonAction]
        public override System.Web.Mvc.ActionResult ImportSiteMarkers(int id, int siteId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportSiteMarkers);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteId", siteId);
            ImportSiteMarkersOverride(callInfo, id, siteId);
            return callInfo;
        }

        [NonAction]
        partial void ImportTreeMarkersOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int treeId);

        [NonAction]
        public override System.Web.Mvc.ActionResult ImportTreeMarkers(int id, int treeId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportTreeMarkers);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "treeId", treeId);
            ImportTreeMarkersOverride(callInfo, id, treeId);
            return callInfo;
        }

        [NonAction]
        partial void ImportTreeMarkerInfoOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int treeId);

        [NonAction]
        public override System.Web.Mvc.ActionResult ImportTreeMarkerInfo(int id, int treeId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportTreeMarkerInfo);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "treeId", treeId);
            ImportTreeMarkerInfoOverride(callInfo, id, treeId);
            return callInfo;
        }

        [NonAction]
        partial void ImportSiteMarkerInfoOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int siteId);

        [NonAction]
        public override System.Web.Mvc.ActionResult ImportSiteMarkerInfo(int id, int siteId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ImportSiteMarkerInfo);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteId", siteId);
            ImportSiteMarkerInfoOverride(callInfo, id, siteId);
            return callInfo;
        }

        [NonAction]
        partial void StateMarkerInfoOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        [NonAction]
        public override System.Web.Mvc.ActionResult StateMarkerInfo(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.StateMarkerInfo);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            StateMarkerInfoOverride(callInfo, id);
            return callInfo;
        }

        [NonAction]
        partial void SiteMarkerInfoOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        [NonAction]
        public override System.Web.Mvc.ActionResult SiteMarkerInfo(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SiteMarkerInfo);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            SiteMarkerInfoOverride(callInfo, id);
            return callInfo;
        }

        [NonAction]
        partial void TreeMarkerInfoOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        [NonAction]
        public override System.Web.Mvc.ActionResult TreeMarkerInfo(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.TreeMarkerInfo);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            TreeMarkerInfoOverride(callInfo, id);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591, 3008, 3009, 0108, 0114
