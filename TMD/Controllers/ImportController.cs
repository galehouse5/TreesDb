using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Imports;
using TMD.Models;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Users;
using TMD.Model.Validation;
using AutoMapper;
using TMD.Model.Photos;
using TMD.Binders;
using TMD.Model.Extensions;

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
        public virtual ActionResult Index()
        {
            return View(Mapper.Map<IList<Trip>, IList<ImportTripSummaryModel>>(
                Repositories.Imports.ListCreatedByUser(User.Id)));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork]
        public virtual ActionResult Index(IUnitOfWork uow, [ModelBinder(typeof(ImportInnerActionModel))] ImportInnerActionModel innerAction)
        {
           if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.Remove))
           {
               var trip = Repositories.Imports.FindById(innerAction.Id);
               if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
               Repositories.Imports.Remove(trip); 
               uow.Persist();
               return View(Mapper.Map<IList<Trip>, IList<ImportTripSummaryModel>>(
                   Repositories.Imports.ListCreatedByUser(User.Id)));
           }
            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult History()
        {
            return View(Mapper.Map<IList<Trip>, IList<ImportTripSummaryModel>>(
                Repositories.Imports.ListCreatedByUser(User.Id)));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork]
        public virtual ActionResult History(IUnitOfWork uow, [ModelBinder(typeof(ImportInnerActionModel))] ImportInnerActionModel innerAction)
        {
            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.Remove))
            {
                var trip = Repositories.Imports.FindById(innerAction.Id);
                if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
                Repositories.Imports.Remove(trip);
                uow.Persist();
                return View(Mapper.Map<IList<Trip>, IList<ImportTripSummaryModel>>(
                    Repositories.Imports.ListCreatedByUser(User.Id)));
            }
            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult New()
        {
            return View("Start", null);
        }

        [HttpPost, ActionName("New"), AuthorizeUser(Roles = UserRoles.Import), UnitOfWork]
        public virtual ActionResult StartNew(IUnitOfWork uow)
        {
            var trip = Model.Imports.Trip.Create();
            Repositories.Imports.Save(trip); 
            uow.Persist();
            return RedirectToAction(Mvc.Import.Trip(trip.Id));
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Start(int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(trip.Id);
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Trip(int id)
        {
            Trip trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var model = new ImportTripModel(); 
            Mapper.Map(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork, SkipValidation]
        public virtual ActionResult Trip(IUnitOfWork uow, ImportTripModel model)
        {
            var trip = Repositories.Imports.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            Mapper.Map(model, trip);
            this.ValidateMappedModel<Trip, ImportTripModel>(trip, ValidationTag.Screening, ValidationTag.Persistence);
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            Repositories.Imports.Save(trip); 
            uow.Persist();
            return RedirectToAction(Mvc.Import.Sites(null, trip.Id));
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork]
        public virtual ActionResult Sites(IUnitOfWork uow, int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            ensureTripHasASite(trip);
            ensureTripSitesHaveASubsite(trip);
            Repositories.Imports.Save(trip);
            uow.Persist();
            var model = new ImportSitesModel();
            Mapper.Map(trip, model);
            return View(model);
        }

        private void ensureTripHasASite(Trip trip)
        {
            if (trip.Sites.Count == 0)
            {
                trip.AddSite();
            }
        }

        private void ensureTripSitesHaveASubsite(Trip trip)
        {
            (from site in trip.Sites
             where site.Subsites.Count < 1
             select site).ForEach(s => s.AddSubsite());
        }

        private void ensureSitesAreSaveableAndRemovable(ImportSitesModel model)
        {
            if (model.Sites.Count == 1)
            {
                model.Sites[0].IsSaveableAndRemovable = false;
            }
            else
            {
                model.Sites.ForEach(s => s.IsSaveableAndRemovable = true);
            }
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork, SkipValidation]
        public virtual ActionResult Sites(IUnitOfWork uow,
            [ModelBinder(typeof(ImportSitesModelBinder))] ImportSitesModel model, 
            [ModelBinder(typeof(ImportInnerActionModel))] ImportInnerActionModel innerAction)
        {
            ModelState.Clear();
            var trip = Repositories.Imports.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            ensureTripHasASite(trip);
            ensureTripSitesHaveASubsite(trip);
            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.Save))
            {
                Mapper.Map(model, trip);
                this.ValidateMappedModel<Trip, ImportSitesModel>(trip, ValidationTag.Screening, ValidationTag.Persistence);
                if (!ModelState.IsValid) 
                {
                    return View(model); 
                }
                (from site in trip.Sites from subsite in site.Subsites select subsite).Last().SetTripDefaults();
                Repositories.Imports.Save(trip);  
                uow.Persist();
                return RedirectToAction(Mvc.Import.Trees(null, trip.Id));
            }
            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.Add))
            {
                var site = trip.AddSite();
                ensureTripSitesHaveASubsite(trip);
                Repositories.Imports.Save(trip); 
                uow.Persist();
                var siteModel = model.AddSite();
                Mapper.Map(site, siteModel);
                ensureSitesAreSaveableAndRemovable(model);
                return Request.IsAjaxRequest() ? 
                    (model.Sites.Count > 2 ? PartialView("SitePartial", model).AddViewData("siteId", site.Id) 
                    : PartialView("SitesPartial", model)) 
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.Save))
            {
                var siteModel = model.FindSiteById(innerAction.Id);
                var site = trip.FindSiteById(innerAction.Id);
                Mapper.Map(siteModel, site);
                this.ValidateMappedModel<Site, ImportSiteModel>(site, 
                    string.Format("Sites[{0}].", model.Sites.IndexOf(siteModel)), 
                    ValidationTag.Screening, ValidationTag.Persistence);
                if (!ModelState.IsValid) 
                {
                    return Request.IsAjaxRequest() ? 
                        PartialView("SitePartial", model).AddViewData("siteId", site.Id) 
                        : View(model); 
                }
                site.Subsites.Last().SetTripDefaults();
                Repositories.Imports.Save(trip); 
                uow.Persist();
                siteModel.IsEditing = false;
                return Request.IsAjaxRequest() ? 
                    PartialView("SitePartial", model).AddViewData("siteId", site.Id) 
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.Remove))
            {
                var site = trip.FindSiteById(innerAction.Id);
                trip.RemoveSite(site);
                Repositories.Imports.Save(trip); 
                uow.Persist();
                var siteModel = model.FindSiteById(site.Id);
                model.RemoveSite(siteModel);
                ensureSitesAreSaveableAndRemovable(model);
                return Request.IsAjaxRequest() ? 
                    (ActionResult)PartialView("SitesPartial", model) 
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.Edit))
            {
                var site = model.FindSiteById(innerAction.Id);
                site.IsEditing = true;
                return Request.IsAjaxRequest() ? 
                    PartialView("SitePartial", model).AddViewData("siteId", site.Id) 
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Site, ImportModelAction.Add))
            {
                var site = trip.FindSiteById(innerAction.Id);
                var subsite = site.AddSubsite();
                Repositories.Imports.Save(trip); 
                uow.Persist();
                var siteModel = model.FindSiteById(innerAction.Id);
                var subsiteModel = siteModel.AddSubsite();                    
                Mapper.Map(subsite, subsiteModel);
                return Request.IsAjaxRequest() ? 
                    PartialView("SitePartial", model).AddViewData("siteId", site.Id) 
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Subsite, ImportModelAction.Remove))
            {
                var subsite = trip.FindSubsiteById(innerAction.Id);
                var site = subsite.Site;
                site.RemoveSubsite(subsite);
                Repositories.Imports.Save(trip); 
                uow.Persist();
                var subsiteModel = model.FindSubsiteById(subsite.Id);
                var siteModel = model.FindSiteById(site.Id);
                siteModel.RemoveSubsite(subsiteModel);
                return Request.IsAjaxRequest() ? 
                    PartialView("SitePartial", model).AddViewData("siteId", site.Id) 
                    : View(model);
            }
            throw new NotImplementedException();
        }

        private void ensureTripSubsitesHaveATree(Trip trip)
        {
            (from site in trip.Sites
             from subsite in site.Subsites
             where subsite.Trees.Count < 1
             select subsite).ForEach(ss => ss.AddSingleTrunkTree());
        }

        private void ensureTreesAreRemovable(ImportTreesModel model)
        {
            (from site in model.Sites
             from subsite in site.Subsites
             from tree in subsite.Trees
             select new { Subsite = subsite, Tree = tree })
             .ForEach(item => item.Tree.IsRemovable = item.Subsite.Trees.Count > 1);
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork]
        public virtual ActionResult Trees(IUnitOfWork uow, int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            ensureTripSubsitesHaveATree(trip); 
            uow.Persist();
            var model = new ImportTreesModel();
            Mapper.Map(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork, SkipValidation]
        public virtual ActionResult Trees(IUnitOfWork uow,
            [ModelBinder(typeof(ImportTreesModelBinder))] ImportTreesModel model, 
            [ModelBinder(typeof(ImportInnerActionModel))] ImportInnerActionModel innerAction)
        {
            ModelState.Clear();
            var trip = Repositories.Imports.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            ensureTripSubsitesHaveATree(trip);
            ensureTreesAreRemovable(model);
            if (innerAction.Equals(ImportModelLevel.Tree, ImportModelAction.Save))
            {
                var tree = trip.FindTreeById(innerAction.Id);
                var treeModel = model.FindTreeById(tree.Id);
                Mapper.Map(treeModel, tree);
                var subsiteModel = model.FindSubsiteContainingTreeWithId(tree.Id);
                var siteModel = model.FindSiteContainingTreeWithId(tree.Id);
                this.ValidateMappedModel<TreeBase, ImportTreeModel>(tree, string.Format(
                    "Sites[{0}].Subsites[{1}].Trees[{2}].", model.Sites.IndexOf(siteModel), siteModel.Subsites.IndexOf(subsiteModel), subsiteModel.Trees.IndexOf(treeModel)),
                    ValidationTag.Screening, ValidationTag.Persistence);
                if (!ModelState.IsValid) 
                {
                    return Request.IsAjaxRequest() ? 
                        PartialView("TreePartial", model).AddViewData("treeId", tree.Id) 
                        : View(model);
                }
                tree.SetTripDefaults();
                Repositories.Imports.Save(trip); 
                uow.Persist();
                treeModel.IsEditing = false;
                return Request.IsAjaxRequest() ? 
                    PartialView("TreePartial", model).AddViewData("treeId", tree.Id)
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Tree, ImportModelAction.Edit))
            {
                var tree = model.FindTreeById(innerAction.Id);
                tree.IsEditing = true;
                return Request.IsAjaxRequest() ? PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Subsite, ImportModelAction.Add))
            {
                var subsite = trip.FindSubsiteById(innerAction.Id);
                var tree = subsite.AddSingleTrunkTree();
                Repositories.Imports.Save(trip); 
                uow.Persist();
                var subsiteModel = model.FindSubsiteById(subsite.Id);
                var treeModel = subsiteModel.AddTree();
                Mapper.Map(tree, treeModel);
                ensureTreesAreRemovable(model);
                return Request.IsAjaxRequest() ? (subsite.Trees.Count > 2 ? 
                    PartialView("TreePartial", model).AddViewData("treeId", tree.Id) 
                    : PartialView("SubsiteTreesPartial", model).AddViewData("subsiteId", subsite.Id)) 
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Tree, ImportModelAction.Remove))
            {
                var tree = trip.FindTreeById(innerAction.Id);
                var subsite = tree.Subsite;
                tree.Subsite.RemoveTree(tree);
                Repositories.Imports.Save(trip); 
                uow.Persist();
                var treeModel = model.FindTreeById(tree.Id);
                var subsiteModel = model.FindSubsiteById(subsite.Id);
                subsiteModel.RemoveTree(treeModel);
                ensureTreesAreRemovable(model);
                return Request.IsAjaxRequest() ?
                    PartialView("SubsiteTreesPartial", model).AddViewData("subsiteId", subsite.Id)
                    : View(model);
            }
            if (innerAction.Equals(ImportModelLevel.Trip, ImportModelAction.Save))
            {
                Mapper.Map(model, trip);
                this.ValidateMappedModel<Trip, ImportTreesModel>(trip, ValidationTag.Screening, ValidationTag.Persistence);
                if (!ModelState.IsValid)
                {
                    return View(model);
                }
                (from site in trip.Sites from subsite in site.Subsites from tree in subsite.Trees select tree).Last().SetTripDefaults();
                Repositories.Imports.Save(trip); 
                uow.Persist();
                return RedirectToAction(Mvc.Import.Finish(trip.Id));
            }
            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public virtual ActionResult Finish(int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(Mapper.Map<Trip, ImportFinishedTripModel>(trip));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import), UnitOfWork]
        public virtual ActionResult Finalize(IUnitOfWork uow, int id)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            if (trip.IsImported)
            {
                Repositories.Trees.RemoveMeasurementsByTrip(trip);
                Repositories.Sites.RemoveVisitsByTrip(trip);
            }
            Repositories.Imports.Import(trip);
            uow.Persist();
            return RedirectToAction(Mvc.Import.Index());
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
