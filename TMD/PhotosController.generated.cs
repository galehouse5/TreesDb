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
    public partial class PhotosController
    {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public PhotosController() { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected PhotosController(Dummy d) { }

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
        public virtual System.Web.Mvc.ActionResult Caption()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Caption);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult ViewPhoto()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ViewPhoto);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult Remove()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Remove);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult PhotoAdded()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.PhotoAdded);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult AddToImportTree()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.AddToImportTree);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public virtual System.Web.Mvc.ActionResult AddToImportSite()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.AddToImportSite);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public PhotosController Actions { get { return MVC.Photos; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Photos";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "Photos";
        [GeneratedCode("T4MVC", "2.0")]
        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass
        {
            public readonly string Caption = "Caption";
            public readonly string ViewPhoto = "View";
            public readonly string Remove = "Remove";
            public readonly string PhotoAdded = "PhotoAdded";
            public readonly string AddToImportTree = "AddToImportTree";
            public readonly string AddToImportSite = "AddToImportSite";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants
        {
            public const string Caption = "Caption";
            public const string ViewPhoto = "View";
            public const string Remove = "Remove";
            public const string PhotoAdded = "PhotoAdded";
            public const string AddToImportTree = "AddToImportTree";
            public const string AddToImportSite = "AddToImportSite";
        }


        static readonly ActionParamsClass_Caption s_params_Caption = new ActionParamsClass_Caption();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Caption CaptionParams { get { return s_params_Caption; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Caption
        {
            public readonly string id = "id";
        }
        static readonly ActionParamsClass_ViewPhoto s_params_ViewPhoto = new ActionParamsClass_ViewPhoto();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_ViewPhoto ViewPhotoParams { get { return s_params_ViewPhoto; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_ViewPhoto
        {
            public readonly string id = "id";
            public readonly string size = "size";
        }
        static readonly ActionParamsClass_Remove s_params_Remove = new ActionParamsClass_Remove();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Remove RemoveParams { get { return s_params_Remove; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Remove
        {
            public readonly string id = "id";
        }
        static readonly ActionParamsClass_PhotoAdded s_params_PhotoAdded = new ActionParamsClass_PhotoAdded();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_PhotoAdded PhotoAddedParams { get { return s_params_PhotoAdded; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_PhotoAdded
        {
            public readonly string gallery = "gallery";
        }
        static readonly ActionParamsClass_AddToImportTree s_params_AddToImportTree = new ActionParamsClass_AddToImportTree();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_AddToImportTree AddToImportTreeParams { get { return s_params_AddToImportTree; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_AddToImportTree
        {
            public readonly string id = "id";
            public readonly string treeId = "treeId";
            public readonly string imageData = "imageData";
        }
        static readonly ActionParamsClass_AddToImportSite s_params_AddToImportSite = new ActionParamsClass_AddToImportSite();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_AddToImportSite AddToImportSiteParams { get { return s_params_AddToImportSite; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_AddToImportSite
        {
            public readonly string id = "id";
            public readonly string siteId = "siteId";
            public readonly string imageData = "imageData";
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
                public readonly string CaptionPartial = "CaptionPartial";
                public readonly string EditPhotoGalleryPartial = "EditPhotoGalleryPartial";
            }
            public readonly string CaptionPartial = "~/Views/Photos/CaptionPartial.cshtml";
            public readonly string EditPhotoGalleryPartial = "~/Views/Photos/EditPhotoGalleryPartial.cshtml";
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public partial class T4MVC_PhotosController : TMD.Controllers.PhotosController
    {
        public T4MVC_PhotosController() : base(Dummy.Instance) { }

        [NonAction]
        partial void CaptionOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        [NonAction]
        public override System.Web.Mvc.ActionResult Caption(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Caption);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            CaptionOverride(callInfo, id);
            return callInfo;
        }

        [NonAction]
        partial void ViewPhotoOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, TMD.Model.Photos.PhotoSize size);

        [NonAction]
        public override System.Web.Mvc.ActionResult ViewPhoto(int id, TMD.Model.Photos.PhotoSize size)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.ViewPhoto);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "size", size);
            ViewPhotoOverride(callInfo, id, size);
            return callInfo;
        }

        [NonAction]
        partial void RemoveOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id);

        [NonAction]
        public override System.Web.Mvc.ActionResult Remove(int id)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Remove);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            RemoveOverride(callInfo, id);
            return callInfo;
        }

        [NonAction]
        partial void PhotoAddedOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, TMD.Models.PhotoGalleryModel gallery);

        [NonAction]
        public override System.Web.Mvc.ActionResult PhotoAdded(TMD.Models.PhotoGalleryModel gallery)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.PhotoAdded);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "gallery", gallery);
            PhotoAddedOverride(callInfo, gallery);
            return callInfo;
        }

        [NonAction]
        partial void AddToImportTreeOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int treeId, System.Web.HttpPostedFileBase imageData);

        [NonAction]
        public override System.Web.Mvc.ActionResult AddToImportTree(int id, int treeId, System.Web.HttpPostedFileBase imageData)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.AddToImportTree);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "treeId", treeId);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "imageData", imageData);
            AddToImportTreeOverride(callInfo, id, treeId, imageData);
            return callInfo;
        }

        [NonAction]
        partial void AddToImportSiteOverride(T4MVC_System_Web_Mvc_ActionResult callInfo, int id, int siteId, System.Web.HttpPostedFileBase imageData);

        [NonAction]
        public override System.Web.Mvc.ActionResult AddToImportSite(int id, int siteId, System.Web.HttpPostedFileBase imageData)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.AddToImportSite);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "id", id);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "siteId", siteId);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "imageData", imageData);
            AddToImportSiteOverride(callInfo, id, siteId, imageData);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591, 3008, 3009, 0108, 0114
