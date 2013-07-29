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
namespace TMD.Controllers
{
    public partial class TreesController
    {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public TreesController() { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected TreesController(Dummy d) { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(ActionResult result)
        {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoute(callInfo.RouteValueDictionary);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToActionPermanent(ActionResult result)
        {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoutePermanent(callInfo.RouteValueDictionary);
        }

        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult FindKnownSpeciesWithSimilarCommonName()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.FindKnownSpeciesWithSimilarCommonName);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult FindKnownSpeciesWithSimilarScientificName()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.FindKnownSpeciesWithSimilarScientificName);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public TreesController Actions { get { return MVC.Trees; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Trees";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "Trees";

        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass
        {
            public readonly string FindKnownSpeciesWithSimilarCommonName = "FindKnownSpeciesWithSimilarCommonName";
            public readonly string FindKnownSpeciesWithSimilarScientificName = "FindKnownSpeciesWithSimilarScientificName";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants
        {
            public const string FindKnownSpeciesWithSimilarCommonName = "FindKnownSpeciesWithSimilarCommonName";
            public const string FindKnownSpeciesWithSimilarScientificName = "FindKnownSpeciesWithSimilarScientificName";
        }


        static readonly ActionParamsClass_FindKnownSpeciesWithSimilarCommonName s_params_FindKnownSpeciesWithSimilarCommonName = new ActionParamsClass_FindKnownSpeciesWithSimilarCommonName();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_FindKnownSpeciesWithSimilarCommonName FindKnownSpeciesWithSimilarCommonNameParams { get { return s_params_FindKnownSpeciesWithSimilarCommonName; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_FindKnownSpeciesWithSimilarCommonName
        {
            public readonly string term = "term";
            public readonly string results = "results";
        }
        static readonly ActionParamsClass_FindKnownSpeciesWithSimilarScientificName s_params_FindKnownSpeciesWithSimilarScientificName = new ActionParamsClass_FindKnownSpeciesWithSimilarScientificName();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_FindKnownSpeciesWithSimilarScientificName FindKnownSpeciesWithSimilarScientificNameParams { get { return s_params_FindKnownSpeciesWithSimilarScientificName; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_FindKnownSpeciesWithSimilarScientificName
        {
            public readonly string term = "term";
            public readonly string results = "results";
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
            }
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public partial class T4MVC_TreesController : TMD.Controllers.TreesController
    {
        public T4MVC_TreesController() : base(Dummy.Instance) { }

        partial void FindKnownSpeciesWithSimilarCommonNameOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, string term, int results);

        public override System.Web.Mvc.ActionResult FindKnownSpeciesWithSimilarCommonName(string term, int results)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.FindKnownSpeciesWithSimilarCommonName);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "term", term);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "results", results);
            FindKnownSpeciesWithSimilarCommonNameOverride(callInfo, term, results);
            return callInfo;
        }

        partial void FindKnownSpeciesWithSimilarScientificNameOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, string term, int results);

        public override System.Web.Mvc.ActionResult FindKnownSpeciesWithSimilarScientificName(string term, int results)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.FindKnownSpeciesWithSimilarScientificName);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "term", term);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "results", results);
            FindKnownSpeciesWithSimilarScientificNameOverride(callInfo, term, results);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591
