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
    public partial class BrowseController
    {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public BrowseController() { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected BrowseController(Dummy d) { }

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
        public virtual System.Web.Mvc.ActionResult MenuWidget()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.MenuWidget);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult TreeDetails()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.TreeDetails);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult SiteDetails()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SiteDetails);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult SpeciesDetails()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SpeciesDetails);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult StateDetails()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.StateDetails);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public BrowseController Actions { get { return MVC.Browse; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Browse";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "Browse";

        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass
        {
            public readonly string MenuWidget = "MenuWidget";
            public readonly string TreeDetails = "TreeDetails";
            public readonly string SiteDetails = "SiteDetails";
            public readonly string SpeciesDetails = "SpeciesDetails";
            public readonly string StateDetails = "StateDetails";
            public readonly string Species = "Species";
            public readonly string Locations = "Locations";
            public readonly string Index = "Index";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants
        {
            public const string MenuWidget = "MenuWidget";
            public const string TreeDetails = "TreeDetails";
            public const string SiteDetails = "SiteDetails";
            public const string SpeciesDetails = "SpeciesDetails";
            public const string StateDetails = "StateDetails";
            public const string Species = "Species";
            public const string Locations = "Locations";
            public const string Index = "Index";
        }


        static readonly ActionParamsClass_MenuWidget s_params_MenuWidget = new ActionParamsClass_MenuWidget();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_MenuWidget MenuWidgetParams { get { return s_params_MenuWidget; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_MenuWidget
        {
            public readonly string isSelected = "isSelected";
        }
        static readonly ActionParamsClass_TreeDetails s_params_TreeDetails = new ActionParamsClass_TreeDetails();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_TreeDetails TreeDetailsParams { get { return s_params_TreeDetails; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_TreeDetails
        {
            public readonly string id = "id";
        }
        static readonly ActionParamsClass_SiteDetails s_params_SiteDetails = new ActionParamsClass_SiteDetails();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_SiteDetails SiteDetailsParams { get { return s_params_SiteDetails; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_SiteDetails
        {
            public readonly string id = "id";
            public readonly string page = "page";
            public readonly string sort = "sort";
            public readonly string sortAsc = "sortAsc";
        }
        static readonly ActionParamsClass_SpeciesDetails s_params_SpeciesDetails = new ActionParamsClass_SpeciesDetails();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_SpeciesDetails SpeciesDetailsParams { get { return s_params_SpeciesDetails; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_SpeciesDetails
        {
            public readonly string botanicalName = "botanicalName";
            public readonly string commonName = "commonName";
            public readonly string siteId = "siteId";
            public readonly string stateId = "stateId";
            public readonly string stateSpeciesPage = "stateSpeciesPage";
            public readonly string stateSpeciesSort = "stateSpeciesSort";
            public readonly string stateSpeciesSortAsc = "stateSpeciesSortAsc";
            public readonly string treesPage = "treesPage";
            public readonly string treesSort = "treesSort";
            public readonly string treesSortAsc = "treesSortAsc";
            public readonly string siteSpeciesPage = "siteSpeciesPage";
            public readonly string siteSpeciesSort = "siteSpeciesSort";
            public readonly string siteSpeciesSortAsc = "siteSpeciesSortAsc";
            public readonly string parameterNamePrefix = "parameterNamePrefix";
        }
        static readonly ActionParamsClass_StateDetails s_params_StateDetails = new ActionParamsClass_StateDetails();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_StateDetails StateDetailsParams { get { return s_params_StateDetails; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_StateDetails
        {
            public readonly string id = "id";
            public readonly string stateSpeciesPage = "stateSpeciesPage";
            public readonly string stateSpeciesSort = "stateSpeciesSort";
            public readonly string stateSpeciesSortAsc = "stateSpeciesSortAsc";
            public readonly string subsitesPage = "subsitesPage";
            public readonly string subsitesSort = "subsitesSort";
            public readonly string subsitesSortAsc = "subsitesSortAsc";
            public readonly string parameterNamePrefix = "parameterNamePrefix";
        }
        static readonly ActionParamsClass_Species s_params_Species = new ActionParamsClass_Species();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Species SpeciesParams { get { return s_params_Species; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Species
        {
            public readonly string page = "page";
            public readonly string sort = "sort";
            public readonly string sortAsc = "sortAsc";
            public readonly string botanicalNameFilter = "botanicalNameFilter";
            public readonly string commonNameFilter = "commonNameFilter";
        }
        static readonly ActionParamsClass_Locations s_params_Locations = new ActionParamsClass_Locations();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Locations LocationsParams { get { return s_params_Locations; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Locations
        {
            public readonly string page = "page";
            public readonly string sort = "sort";
            public readonly string sortAsc = "sortAsc";
            public readonly string stateFilter = "stateFilter";
            public readonly string siteFilter = "siteFilter";
            public readonly string subsiteFilter = "subsiteFilter";
        }
        static readonly ActionParamsClass_Index s_params_Index = new ActionParamsClass_Index();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Index IndexParams { get { return s_params_Index; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Index
        {
            public readonly string speciesPage = "speciesPage";
            public readonly string speciesSort = "speciesSort";
            public readonly string speciesSortAsc = "speciesSortAsc";
            public readonly string speciesBotanicalNameFilter = "speciesBotanicalNameFilter";
            public readonly string speciesCommonNameFilter = "speciesCommonNameFilter";
            public readonly string locationsPage = "locationsPage";
            public readonly string locationsSort = "locationsSort";
            public readonly string locationsSortAsc = "locationsSortAsc";
            public readonly string locationsStateFilter = "locationsStateFilter";
            public readonly string locationsSiteFilter = "locationsSiteFilter";
            public readonly string locationsSubsiteFilter = "locationsSubsiteFilter";
            public readonly string parameterNamePrefix = "parameterNamePrefix";
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
                public readonly string GlobalSpeciesGridPartial = "GlobalSpeciesGridPartial";
                public readonly string Index = "Index";
                public readonly string Locations = "Locations";
                public readonly string LocationsGridPartial = "LocationsGridPartial";
                public readonly string MenuWidget = "MenuWidget";
                public readonly string SiteDetails = "SiteDetails";
                public readonly string SitesGridPartial = "SitesGridPartial";
                public readonly string SiteSpeciesGridPartial = "SiteSpeciesGridPartial";
                public readonly string Species = "Species";
                public readonly string SpeciesByStateGridPartial = "SpeciesByStateGridPartial";
                public readonly string SpeciesDetails = "SpeciesDetails";
                public readonly string StateDetails = "StateDetails";
                public readonly string StateSpeciesGridPartial = "StateSpeciesGridPartial";
                public readonly string SubsiteSpeciesGridPartial = "SubsiteSpeciesGridPartial";
                public readonly string TreeDetails = "TreeDetails";
                public readonly string TreesGridPartial = "TreesGridPartial";
            }
            public readonly string GlobalSpeciesGridPartial = "~/Views/Browse/GlobalSpeciesGridPartial.cshtml";
            public readonly string Index = "~/Views/Browse/Index.cshtml";
            public readonly string Locations = "~/Views/Browse/Locations.cshtml";
            public readonly string LocationsGridPartial = "~/Views/Browse/LocationsGridPartial.cshtml";
            public readonly string MenuWidget = "~/Views/Browse/MenuWidget.cshtml";
            public readonly string SiteDetails = "~/Views/Browse/SiteDetails.cshtml";
            public readonly string SitesGridPartial = "~/Views/Browse/SitesGridPartial.cshtml";
            public readonly string SiteSpeciesGridPartial = "~/Views/Browse/SiteSpeciesGridPartial.cshtml";
            public readonly string Species = "~/Views/Browse/Species.cshtml";
            public readonly string SpeciesByStateGridPartial = "~/Views/Browse/SpeciesByStateGridPartial.cshtml";
            public readonly string SpeciesDetails = "~/Views/Browse/SpeciesDetails.cshtml";
            public readonly string StateDetails = "~/Views/Browse/StateDetails.cshtml";
            public readonly string StateSpeciesGridPartial = "~/Views/Browse/StateSpeciesGridPartial.cshtml";
            public readonly string SubsiteSpeciesGridPartial = "~/Views/Browse/SubsiteSpeciesGridPartial.cshtml";
            public readonly string TreeDetails = "~/Views/Browse/TreeDetails.cshtml";
            public readonly string TreesGridPartial = "~/Views/Browse/TreesGridPartial.cshtml";
            static readonly _DisplayTemplatesClass s_DisplayTemplates = new _DisplayTemplatesClass();
            public _DisplayTemplatesClass DisplayTemplates { get { return s_DisplayTemplates; } }
            [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
            public partial class _DisplayTemplatesClass
            {
                public readonly string BrowsePhotoSumaryModel = "BrowsePhotoSumaryModel";
                public readonly string BrowsePhotoSummaryList = "BrowsePhotoSummaryList";
                public readonly string BrowseTreeDetailsModel = "BrowseTreeDetailsModel";
                public readonly string BrowseTreeSummaryModel = "BrowseTreeSummaryModel";
            }
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public partial class T4MVC_BrowseController : TMD.Controllers.BrowseController
    {
        public T4MVC_BrowseController() : base(Dummy.Instance) { }

        partial void MenuWidgetOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, bool isSelected);

        public override System.Web.Mvc.ActionResult MenuWidget(bool isSelected)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.MenuWidget);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "isSelected", isSelected);
            MenuWidgetOverride(callInfo, isSelected);
            return callInfo;
        }

        partial void TreeDetailsOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        public override System.Web.Mvc.ActionResult TreeDetails(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.TreeDetails);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            TreeDetailsOverride(callInfo, id);
            return callInfo;
        }

        partial void SiteDetailsOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int? page, string sort, bool? sortAsc);

        public override System.Web.Mvc.ActionResult SiteDetails(int id, int? page, string sort, bool? sortAsc)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SiteDetails);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "page", page);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "sort", sort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "sortAsc", sortAsc);
            SiteDetailsOverride(callInfo, id, page, sort, sortAsc);
            return callInfo;
        }

        partial void SpeciesDetailsOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, string botanicalName, string commonName, int? siteId, int? stateId, int? stateSpeciesPage, string stateSpeciesSort, bool? stateSpeciesSortAsc, int? treesPage, string treesSort, bool? treesSortAsc, int? siteSpeciesPage, string siteSpeciesSort, bool? siteSpeciesSortAsc, string parameterNamePrefix);

        public override System.Web.Mvc.ActionResult SpeciesDetails(string botanicalName, string commonName, int? siteId, int? stateId, int? stateSpeciesPage, string stateSpeciesSort, bool? stateSpeciesSortAsc, int? treesPage, string treesSort, bool? treesSortAsc, int? siteSpeciesPage, string siteSpeciesSort, bool? siteSpeciesSortAsc, string parameterNamePrefix)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.SpeciesDetails);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "botanicalName", botanicalName);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "commonName", commonName);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteId", siteId);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateId", stateId);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateSpeciesPage", stateSpeciesPage);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateSpeciesSort", stateSpeciesSort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateSpeciesSortAsc", stateSpeciesSortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "treesPage", treesPage);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "treesSort", treesSort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "treesSortAsc", treesSortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteSpeciesPage", siteSpeciesPage);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteSpeciesSort", siteSpeciesSort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteSpeciesSortAsc", siteSpeciesSortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "parameterNamePrefix", parameterNamePrefix);
            SpeciesDetailsOverride(callInfo, botanicalName, commonName, siteId, stateId, stateSpeciesPage, stateSpeciesSort, stateSpeciesSortAsc, treesPage, treesSort, treesSortAsc, siteSpeciesPage, siteSpeciesSort, siteSpeciesSortAsc, parameterNamePrefix);
            return callInfo;
        }

        partial void StateDetailsOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int? stateSpeciesPage, string stateSpeciesSort, bool? stateSpeciesSortAsc, int? subsitesPage, string subsitesSort, bool? subsitesSortAsc, string parameterNamePrefix);

        public override System.Web.Mvc.ActionResult StateDetails(int id, int? stateSpeciesPage, string stateSpeciesSort, bool? stateSpeciesSortAsc, int? subsitesPage, string subsitesSort, bool? subsitesSortAsc, string parameterNamePrefix)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.StateDetails);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateSpeciesPage", stateSpeciesPage);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateSpeciesSort", stateSpeciesSort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateSpeciesSortAsc", stateSpeciesSortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "subsitesPage", subsitesPage);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "subsitesSort", subsitesSort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "subsitesSortAsc", subsitesSortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "parameterNamePrefix", parameterNamePrefix);
            StateDetailsOverride(callInfo, id, stateSpeciesPage, stateSpeciesSort, stateSpeciesSortAsc, subsitesPage, subsitesSort, subsitesSortAsc, parameterNamePrefix);
            return callInfo;
        }

        partial void SpeciesOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int? page, string sort, bool? sortAsc, string botanicalNameFilter, string commonNameFilter);

        public override System.Web.Mvc.ActionResult Species(int? page, string sort, bool? sortAsc, string botanicalNameFilter, string commonNameFilter)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Species);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "page", page);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "sort", sort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "sortAsc", sortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "botanicalNameFilter", botanicalNameFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "commonNameFilter", commonNameFilter);
            SpeciesOverride(callInfo, page, sort, sortAsc, botanicalNameFilter, commonNameFilter);
            return callInfo;
        }

        partial void LocationsOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int? page, string sort, bool? sortAsc, string stateFilter, string siteFilter, string subsiteFilter);

        public override System.Web.Mvc.ActionResult Locations(int? page, string sort, bool? sortAsc, string stateFilter, string siteFilter, string subsiteFilter)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Locations);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "page", page);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "sort", sort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "sortAsc", sortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "stateFilter", stateFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteFilter", siteFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "subsiteFilter", subsiteFilter);
            LocationsOverride(callInfo, page, sort, sortAsc, stateFilter, siteFilter, subsiteFilter);
            return callInfo;
        }

        partial void IndexOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int? speciesPage, string speciesSort, bool? speciesSortAsc, string speciesBotanicalNameFilter, string speciesCommonNameFilter, int? locationsPage, string locationsSort, bool? locationsSortAsc, string locationsStateFilter, string locationsSiteFilter, string locationsSubsiteFilter, string parameterNamePrefix);

        public override System.Web.Mvc.ActionResult Index(int? speciesPage, string speciesSort, bool? speciesSortAsc, string speciesBotanicalNameFilter, string speciesCommonNameFilter, int? locationsPage, string locationsSort, bool? locationsSortAsc, string locationsStateFilter, string locationsSiteFilter, string locationsSubsiteFilter, string parameterNamePrefix)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Index);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "speciesPage", speciesPage);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "speciesSort", speciesSort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "speciesSortAsc", speciesSortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "speciesBotanicalNameFilter", speciesBotanicalNameFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "speciesCommonNameFilter", speciesCommonNameFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "locationsPage", locationsPage);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "locationsSort", locationsSort);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "locationsSortAsc", locationsSortAsc);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "locationsStateFilter", locationsStateFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "locationsSiteFilter", locationsSiteFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "locationsSubsiteFilter", locationsSubsiteFilter);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "parameterNamePrefix", parameterNamePrefix);
            IndexOverride(callInfo, speciesPage, speciesSort, speciesSortAsc, speciesBotanicalNameFilter, speciesCommonNameFilter, locationsPage, locationsSort, locationsSortAsc, locationsStateFilter, locationsSiteFilter, locationsSubsiteFilter, parameterNamePrefix);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591
