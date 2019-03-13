using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using TMD.Binders;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Imports;
using TMD.Model.Users;
using TMD.Model.Validation;
using TMD.Models.Import;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class ImportController : ControllerBase
    {
        [ChildActionOnly]
        public virtual ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new ImportMenuWidgetModel
            {
                IsSelected = isSelected,
                CanImport = User.IsInRole(UserRoles.Import),
                LatestTrip = Repositories.Imports.FindLastCreatedByUser(User.Id)
            });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult History()
        {
            return View(Mapper.Map<IList<Trip>, IList<ImportTripSummaryModel>>(
                Repositories.Imports.ListCreatedByUser(User.Id)));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult History([ModelBinder(typeof(ImportInnerActionModel))] ImportInnerActionModel innerAction)
        {
            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.Remove))
            {
                var trip = Repositories.Imports.FindById(innerAction.Id);
                if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
                Repositories.Imports.Remove(trip);
                Uow.Persist();
                return View(Mapper.Map<IList<Trip>, IList<ImportTripSummaryModel>>(
                    Repositories.Imports.ListCreatedByUser(User.Id)));
            }

            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Trip(int? id)
        {
            Trip trip = !id.HasValue ? Model.Imports.Trip.Create()
                : Repositories.Imports.FindById(id.Value);
            if (!User.IsAuthorizedToEdit(trip))
                return new UnauthorizedResult();

            var model = new ImportTripModel();
            Mapper.Map(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), SkipValidation]
        public virtual ActionResult Trip(ImportTripModel model)
        {
            Trip trip = model.Id == 0 ? Model.Imports.Trip.Create()
                : Repositories.Imports.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip))
                return new UnauthorizedResult();

            Mapper.Map(model, trip);
            trip.InitializeSites();
            this.ValidateMappedModel<Trip, ImportTripModel>(trip, ValidationTag.Required);
            if (!ModelState.IsValid) return View(model);

            Repositories.Imports.Save(trip);
            Uow.Persist();
            return RedirectToAction(MVC.Import.Sites(trip.Id));
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Sites(int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip))
                return new UnauthorizedResult();

            trip.InitializeSites();
            Repositories.Imports.Save(trip);
            Uow.Persist();

            var model = Mapper.Map(trip, new ImportSitesModel());
            return View(model);
        }

        protected ActionResult SaveSites(ImportSitesModel model, Trip trip, bool saveUnlessOptionalErrors)
        {
            Mapper.Map(model, trip);

            trip.VisitSites((p, s) => this.ValidateMappedModel<Site, ImportSiteModel>(s, $"{p}.", ValidationTag.Required));
            if (!ModelState.IsValid) return View(model);

            trip.VisitSites((p, s) => this.ValidateMappedModel<Site, ImportSiteModel>(s, $"{p}.", ValidationTag.Optional));
            if (!ModelState.IsValid && saveUnlessOptionalErrors)
            {
                model.HasOptionalErrors = true;
                return View(model);
            }

            trip.Sites.Last().SetTripDefaults();
            Repositories.Imports.Save(trip);
            Uow.Persist();

            return RedirectToAction(MVC.Import.Trees(trip.Id));
        }

        protected ActionResult AddSite(ImportSitesModel model, Trip trip)
        {
            var site = trip.AddSite();
            trip.InitializeSites();
            Repositories.Imports.Save(trip);
            Uow.Persist();

            Mapper.Map(site, model.AddSite());
            model.Initialize();

            return Request.IsAjaxRequest() ?
                (model.Sites.Count > 2 ? PartialView("SitePartial", model).AddViewData("siteId", site.Id)
                : PartialView("SitesPartial", model))
                : View(model);
        }

        protected ActionResult SaveSite(ImportSitesModel model, Trip trip, int siteId, bool saveUnlessOptionalErrors)
        {
            var siteModel = model.FindSiteById(siteId);
            var site = trip.FindSiteById(siteId);
            Mapper.Map(siteModel, site);

            string modelPrefix = $"Sites[{model.Sites.IndexOf(siteModel)}].";
            this.ValidateMappedModel<Site, ImportSiteModel>(site, modelPrefix, ValidationTag.Required);
            if (!ModelState.IsValid) return Request.IsAjaxRequest() ?
                    PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);

            this.ValidateMappedModel<Site, ImportSiteModel>(site, modelPrefix, ValidationTag.Optional);
            if (!ModelState.IsValid && saveUnlessOptionalErrors)
            {
                siteModel.HasOptionalError = true;
                model.HasOptionalErrors = true;
                return Request.IsAjaxRequest() ?
                    PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);
            }

            site.SetTripDefaults();
            Repositories.Imports.Save(trip);
            Uow.Persist();

            siteModel.IsEditing = false;
            return Request.IsAjaxRequest() ?
                PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);
        }

        protected ActionResult RemoveSite(ImportSitesModel model, Trip trip, int siteId)
        {
            var site = trip.FindSiteById(siteId);
            trip.RemoveSite(site);
            Repositories.Imports.Save(trip);
            Uow.Persist();

            var siteModel = model.FindSiteById(site.Id);
            model.RemoveSite(siteModel);
            model.Initialize();

            return Request.IsAjaxRequest() ?
                PartialView("SitesPartial", model) : (ActionResult)View(model);
        }

        protected ActionResult EditSite(ImportSitesModel model, Trip trip, int siteId)
        {
            var site = model.FindSiteById(siteId);
            site.IsEditing = true;

            return Request.IsAjaxRequest() ?
                PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), SkipValidation]
        public virtual ActionResult Sites(
            [ModelBinder(typeof(ImportSitesModelBinder))] ImportSitesModel model,
            [ModelBinder(typeof(ImportInnerActionModel))] ImportInnerActionModel innerAction)
        {
            ModelState.Clear();

            var trip = Repositories.Imports.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip))
                return new UnauthorizedResult();

            trip.InitializeSites();

            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.SaveUnlessOptionalErrors)
                || innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.SaveIgnoringOptionalErrors))
                return SaveSites(model, trip, innerAction.Action == ImportModelAction.SaveUnlessOptionalErrors);

            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.Add))
                return AddSite(model, trip);

            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.SaveUnlessOptionalErrors)
                || innerAction.Equals(ImportModelLevel.Site, ImportModelAction.SaveIgnoringOptionalErrors))
                return SaveSite(model, trip, innerAction.Id, innerAction.Action == ImportModelAction.SaveUnlessOptionalErrors);

            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.Remove))
                return RemoveSite(model, trip, innerAction.Id);

            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.Edit))
                return EditSite(model, trip, innerAction.Id);

            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Trees(int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip))
                return new UnauthorizedResult();

            trip.InitializeTrees();
            Uow.Persist();

            var model = Mapper.Map(trip, new ImportTreesModel());
            return View(model);
        }

        protected ActionResult SaveTree(ImportTreesModel model, Trip trip, int treeId, bool saveUnlessOptionalErrors)
        {
            var tree = trip.FindTreeById(treeId);
            var treeModel = model.FindTreeById(tree.Id);
            Mapper.Map(treeModel, tree);

            var siteModel = model.FindSiteContainingTreeWithId(tree.Id);

            string modelPrefix = $"Sites[{model.Sites.IndexOf(siteModel)}].Trees[{siteModel.Trees.IndexOf(treeModel)}].";
            this.ValidateMappedModel<TreeBase, ImportTreeModel>(tree, modelPrefix, ValidationTag.Required);
            if (!ModelState.IsValid) return Request.IsAjaxRequest() ?
                    PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);

            this.ValidateMappedModel<TreeBase, ImportTreeModel>(tree, modelPrefix, ValidationTag.Optional);
            if (!ModelState.IsValid && saveUnlessOptionalErrors)
            {
                treeModel.HasOptionalErrors = true;
                model.HasOptionalErrors = true;
                return Request.IsAjaxRequest() ?
                    PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);
            }

            tree.SetTripDefaults();
            Repositories.Imports.Save(trip);
            Uow.Persist();

            treeModel.IsEditing = false;
            return Request.IsAjaxRequest() ? PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);
        }

        protected ActionResult EditTree(ImportTreesModel model, Trip trip, int treeId)
        {
            var tree = model.FindTreeById(treeId);
            tree.IsEditing = true;

            return Request.IsAjaxRequest() ?
                PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);
        }

        protected ActionResult AddTree(ImportTreesModel model, Trip trip, int siteId)
        {
            var site = trip.FindSiteById(siteId);
            var tree = site.AddSingleTrunkTree();
            Repositories.Imports.Save(trip);
            Uow.Persist();

            var siteModel = model.FindSiteById(site.Id);
            var treeModel = siteModel.AddTree();
            Mapper.Map(tree, treeModel);
            model.Initialize();

            return Request.IsAjaxRequest() ? (site.Trees.Count > 2 ?
                PartialView("TreePartial", model).AddViewData("treeId", tree.Id)
                : PartialView("SiteTreesPartial", model).AddViewData("siteId", site.Id))
                : View(model);
        }

        protected ActionResult RemoveTree(ImportTreesModel model, Trip trip, int treeId)
        {
            var tree = trip.FindTreeById(treeId);
            var site = tree.Site;
            tree.Site.RemoveTree(tree);
            Repositories.Imports.Save(trip);
            Uow.Persist();

            var treeModel = model.FindTreeById(tree.Id);
            var siteModel = model.FindSiteById(site.Id);
            siteModel.RemoveTree(treeModel);
            model.Initialize();

            return Request.IsAjaxRequest() ?
                PartialView("SiteTreesPartial", model).AddViewData("siteId", site.Id) : View(model);
        }

        protected ActionResult SaveTrees(ImportTreesModel model, Trip trip, bool saveUnlessOptionalErrors)
        {
            Mapper.Map(model, trip);

            trip.VisitTrees((p, t) => this.ValidateMappedModel<TreeBase, ImportTreeModel>(t, $"{p}.", ValidationTag.Required));
            if (!ModelState.IsValid) return View(model);

            trip.VisitTrees((p, t) => this.ValidateMappedModel<TreeBase, ImportTreeModel>(t, $"{p}.", ValidationTag.Optional));
            if (!ModelState.IsValid && saveUnlessOptionalErrors)
            {
                model.HasOptionalErrors = true;
                return View(model);
            }

            trip.Sites.SelectMany(s => s.Trees).Last().SetTripDefaults();
            Repositories.Imports.Save(trip);
            Uow.Persist();

            return RedirectToAction(MVC.Import.Review(trip.Id));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), SkipValidation]
        public virtual ActionResult Trees(
            [ModelBinder(typeof(ImportTreesModelBinder))] ImportTreesModel model,
            [ModelBinder(typeof(ImportInnerActionModel))] ImportInnerActionModel innerAction)
        {
            ModelState.Clear();

            var trip = Repositories.Imports.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip))
                return new UnauthorizedResult();

            trip.InitializeTrees();
            model.Initialize();

            if (innerAction.Equals(ImportModelLevel.Tree, ImportModelAction.SaveUnlessOptionalErrors)
                || innerAction.Equals(ImportModelLevel.Tree, ImportModelAction.SaveIgnoringOptionalErrors))
                return SaveTree(model, trip, innerAction.Id, innerAction.Action == ImportModelAction.SaveUnlessOptionalErrors);

            if (innerAction.Equals(ImportModelLevel.Tree, ImportModelAction.Edit))
                return EditTree(model, trip, innerAction.Id);

            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.Add))
                return AddTree(model, trip, innerAction.Id);

            if (innerAction.Equals(ImportModelLevel.Tree, ImportModelAction.Remove))
                return RemoveTree(model, trip, innerAction.Id);

            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.SaveUnlessOptionalErrors)
                || innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.SaveIgnoringOptionalErrors))
                return SaveTrees(model, trip, innerAction.Action == ImportModelAction.SaveUnlessOptionalErrors);

            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Review(int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(Mapper.Map<Trip, ImportFinishedTripModel>(trip));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Finish(int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            if (trip.IsImported)
            {
                Repositories.Imports.Reimport(trip);
            }
            else
            {
                Repositories.Imports.Import(trip);
            }
            Uow.Persist();
            return RedirectToAction(MVC.Import.History());
        }

        [ActionName("View"), DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult ViewImport(int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(Mapper.Map<Trip, ImportFinishedTripModel>(trip));
        }
    }
}
