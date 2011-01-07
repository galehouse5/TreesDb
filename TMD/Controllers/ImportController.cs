using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Trips;
using TMD.Models;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Users;
using TMD.Model.Extensions;
using TMD.Model.Validation;
using AutoMapper;
using TMD.Model.Photos;
using System.Diagnostics;
using TMD.Binders;

namespace TMD.Controllers
{
    [DebuggerDisplay("{Action} {Level} with Id {Id}")]
    public class ImportInnerAction : IModelBinder
    {
        public enum EntityLevel { Unknown, Trip, Site, Subsite, Tree }
        public enum EntityAction { Unknown, Add, Save, Edit, Remove, AdvancedEdit }

        public int Id { get; private set; }
        public EntityAction Action { get; private set; }
        public EntityLevel Level { get; private set; }

        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string expression = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            string[] parts = expression.Split('.');
            return new ImportInnerAction
            {
                Level = parts[0].ParseEnum(EntityLevel.Unknown),
                Id = Convert.ToInt32(parts[1]),
                Action = parts[2].ParseEnum(EntityAction.Unknown)
            };
        }

        public bool Equals(EntityLevel level, EntityAction action)
        {
            return this.Level == level && this.Action == action;
        }
    }

    [CheckBrowserCompatibilityFilter]
    public class ImportController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new ImportMenuWidgetModel
            {
                IsSelected = isSelected,
                CanImport = User.IsInRole(UserRoles.Import),
                LatestTrip = Repositories.Trips.FindLastCreatedByUser(User.Id)
            });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Index()
        {
            return View(Repositories.Trips.ListCreatedByUser(User.Id));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Index([ModelBinder(typeof(ImportInnerAction))] ImportInnerAction innerAction)
        {
            if (innerAction.Equals(ImportInnerAction.EntityLevel.Trip, ImportInnerAction.EntityAction.Remove))
            {
                var trip = Repositories.Trips.FindById(innerAction.Id);
                if (!User.IsAuthorizedToEdit(trip) || trip.IsImported) { return new UnauthorizedResult(); }
                using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Remove(trip); }
                return View(Repositories.Trips.ListCreatedByUser(User.Id));
            }
            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult History()
        {
            return View(Repositories.Trips.ListCreatedByUser(User.Id));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult History([ModelBinder(typeof(ImportInnerAction))] ImportInnerAction innerAction)
        {
            if (innerAction.Equals(ImportInnerAction.EntityLevel.Trip, ImportInnerAction.EntityAction.Remove))
            {
                var trip = Repositories.Trips.FindById(innerAction.Id);
                if (!User.IsAuthorizedToEdit(trip) || trip.IsImported) { return new UnauthorizedResult(); }
                using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Remove(trip); }
                return View(Repositories.Trips.ListCreatedByUser(User.Id));
            }
            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult New()
        {
            return View("Start", Model.Trips.Trip.Create());
        }

        [HttpPost, ActionName("New"), AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult StartNew()
        {
            var trip = Model.Trips.Trip.Create();
            using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Save(trip); }
            return RedirectToAction("Trip", new { id = trip.Id });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Start(int id)
        {
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(trip);
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trip(int id)
        {
            Trip trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var model = new ImportTripModel(); 
            Mapper.Map(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trip(ImportTripModel model)
        {
            var trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            Mapper.Map(model, trip);
            this.ValidateMappedModel<Trip, ImportTripModel>(trip, Tag.Screening, Tag.Persistence);
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Save(trip); }
            return RedirectToAction("Sites", new { id = trip.Id });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Sites(int id)
        {
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.BeginAndPersist())
            {
                ensureTripHasASite(trip);
                ensureTripSitesHaveASubsite(trip);
            }
            var model = new ImportSitesModel();
            Mapper.Map(trip, model);
            return View(model);
        }

        private void ensureTripHasASite(Trip trip)
        {
            if (trip.SiteVisits.Count == 0)
            {
                trip.AddSiteVisit();
                Repositories.Trips.Save(trip);
            }
        }

        private void ensureTripSitesHaveASubsite(Trip trip)
        {
            trip.SiteVisits.ForEach(s =>
                {
                    if (s.SubsiteVisits.Count < 1)
                    {
                        s.AddSubsiteVisit();
                        Repositories.Trips.Save(trip);
                    }
                });
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

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Sites(
            [ModelBinder(typeof(ImportSitesModelBinder))] ImportSitesModel model, 
            [ModelBinder(typeof(ImportInnerAction))] ImportInnerAction innerAction)
        {
            ModelState.Clear();
            var trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.BeginAndPersist())
            {
                ensureTripHasASite(trip);
                ensureTripSitesHaveASubsite(trip);
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Trip, ImportInnerAction.EntityAction.Save))
                {
                    Mapper.Map(model, trip);
                    this.ValidateMappedModel<Trip, ImportSitesModel>(trip, Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) 
                    {
                        UnitOfWork.Rollback();
                        return View(model); 
                    } 
                    Repositories.Trips.Save(trip);
                    return RedirectToAction("Trees", new { id = trip.Id });
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Trip, ImportInnerAction.EntityAction.Add))
                {
                    var site = trip.AddSiteVisit();
                    ensureTripSitesHaveASubsite(trip);
                    Repositories.Trips.Save(trip); UnitOfWork.Flush();
                    var siteModel = model.AddSite();
                    Mapper.Map(site, siteModel);
                    ensureSitesAreSaveableAndRemovable(model);
                    return Request.IsAjaxRequest() ? (model.Sites.Count > 2 ? PartialView("SitePartial", model).AddViewData("siteId", site.Id) : PartialView("SitesPartial", model)) : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Site, ImportInnerAction.EntityAction.Save))
                {
                    var siteModel = model.FindSiteById(innerAction.Id);
                    var site = trip.FindSiteVisitById(innerAction.Id);
                    Mapper.Map(siteModel, site);
                    this.ValidateMappedModel<SiteVisit, ImportSiteModel>(site, string.Format(
                        "Sites[{0}].", model.Sites.IndexOf(siteModel)), 
                        Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) 
                    {
                        UnitOfWork.Rollback();
                        return Request.IsAjaxRequest() ? PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model); 
                    }
                    Repositories.Trips.Save(trip);
                    siteModel.IsEditing = false;
                    return Request.IsAjaxRequest() ? PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Site, ImportInnerAction.EntityAction.Remove))
                {
                    var site = trip.FindSiteVisitById(innerAction.Id);
                    trip.RemoveSiteVisit(site);
                    Repositories.Trips.Save(trip);
                    var siteModel = model.FindSiteById(site.Id);
                    model.RemoveSite(siteModel);
                    ensureSitesAreSaveableAndRemovable(model);
                    return Request.IsAjaxRequest() ? (ActionResult)PartialView("SitesPartial", model) : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Site, ImportInnerAction.EntityAction.Edit))
                {
                    var site = model.FindSiteById(innerAction.Id);
                    site.IsEditing = true;
                    return Request.IsAjaxRequest() ? PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Site, ImportInnerAction.EntityAction.Add))
                {
                    var site = trip.FindSiteVisitById(innerAction.Id);
                    var subsite = site.AddSubsiteVisit();
                    Repositories.Trips.Save(trip); UnitOfWork.Flush();
                    var siteModel = model.FindSiteById(innerAction.Id);
                    var subsiteModel = siteModel.AddSubsite();                    
                    Mapper.Map(subsite, subsiteModel);
                    return Request.IsAjaxRequest() ? PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Subsite, ImportInnerAction.EntityAction.Remove))
                {
                    var subsite = trip.FindSubsiteVisitById(innerAction.Id);
                    var site = subsite.SiteVisit;
                    site.RemoveSubsiteVisit(subsite);
                    Repositories.Trips.Save(trip);
                    var subsiteModel = model.FindSubsiteById(subsite.Id);
                    var siteModel = model.FindSiteById(site.Id);
                    siteModel.RemoveSubsite(subsiteModel);
                    return Request.IsAjaxRequest() ? PartialView("SitePartial", model).AddViewData("siteId", site.Id) : View(model);
                }
            }
            throw new NotImplementedException();
        }

        private void ensureTripSubsitesHaveATree(Trip trip)
        {
            trip.SiteVisits.ForEach(s => s.SubsiteVisits.ForEach(ss =>
            {
                if (ss.TreeMeasurements.Count < 1)
                {
                    ss.AddSingleTrunkTreeMeasurement();
                    Repositories.Trips.Save(trip);
                }
            }));
        }

        private void ensureTreesAreRemovable(ImportTreesModel model)
        {
            foreach (var site in model.Sites)
            {
                foreach (var subsite in site.Subsites)
                {
                    foreach (var tree in subsite.Trees)
                    {
                        tree.IsRemovable = subsite.Trees.Count > 1;
                    }
                }
            }
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trees(int id)
        {
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.Begin())
            {
                ensureTripSubsitesHaveATree(trip);
                UnitOfWork.Persist();
            }
            var model = new ImportTreesModel();
            Mapper.Map(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trees(
            [ModelBinder(typeof(ImportTreesModelBinder))] ImportTreesModel model, 
            [ModelBinder(typeof(ImportInnerAction))] ImportInnerAction innerAction)
        {
            ModelState.Clear();
            var trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.BeginAndPersist())
            {
                ensureTripSubsitesHaveATree(trip);
                ensureTreesAreRemovable(model);
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Tree, ImportInnerAction.EntityAction.Save))
                {
                    var tree = trip.FindTreeMeasurementById(innerAction.Id);
                    var treeModel = model.FindTreeById(tree.Id);
                    Mapper.Map(treeModel, tree);
                    var subsiteModel = model.FindSubsiteContainingTreeWithId(tree.Id);
                    var siteModel = model.FindSiteContainingTreeWithId(tree.Id);
                    this.ValidateMappedModel<TreeMeasurementBase, ImportTreeModel>(tree, string.Format(
                        "Sites[{0}].Subsites[{1}].Trees[{2}].", model.Sites.IndexOf(siteModel), siteModel.Subsites.IndexOf(subsiteModel), subsiteModel.Trees.IndexOf(treeModel)),
                        Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) 
                    { 
                        UnitOfWork.Rollback();
                        return Request.IsAjaxRequest() ? PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);
                    }
                    Repositories.Trips.Save(trip);
                    treeModel.IsEditing = false;
                    return Request.IsAjaxRequest() ? PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Tree, ImportInnerAction.EntityAction.Edit))
                {
                    var tree = model.FindTreeById(innerAction.Id);
                    tree.IsEditing = true;
                    return Request.IsAjaxRequest() ? PartialView("TreePartial", model).AddViewData("treeId", tree.Id) : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Subsite, ImportInnerAction.EntityAction.Add))
                {
                    var subsite = trip.FindSubsiteVisitById(innerAction.Id);
                    var tree = subsite.AddSingleTrunkTreeMeasurement();
                    Repositories.Trips.Save(trip); UnitOfWork.Flush();
                    var subsiteModel = model.FindSubsiteById(subsite.Id);
                    var treeModel = subsiteModel.AddTree();
                    Mapper.Map(tree, treeModel);
                    ensureTreesAreRemovable(model);
                    return Request.IsAjaxRequest() ? (subsite.TreeMeasurements.Count > 2 ? 
                        PartialView("TreePartial", model).AddViewData("treeId", tree.Id) 
                        : PartialView("SubsiteTreesPartial", model).AddViewData("subsiteId", subsite.Id)) 
                        : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Tree, ImportInnerAction.EntityAction.Remove))
                {
                    var tree = trip.FindTreeMeasurementById(innerAction.Id);
                    var subsite = tree.SubsiteVisit;
                    tree.SubsiteVisit.RemoveTreeMeasurement(tree);
                    Repositories.Trips.Save(trip);
                    var treeModel = model.FindTreeById(tree.Id);
                    var subsiteModel = model.FindSubsiteById(subsite.Id);
                    subsiteModel.RemoveTree(treeModel);
                    ensureTreesAreRemovable(model);
                    return Request.IsAjaxRequest() ?
                        PartialView("SubsiteTreesPartial", model).AddViewData("subsiteId", subsite.Id)
                        : View(model);
                }
                if (innerAction.Equals(ImportInnerAction.EntityLevel.Trip, ImportInnerAction.EntityAction.Save))
                {
                    Mapper.Map(model, trip);
                    this.ValidateMappedModel<Trip, ImportTreesModel>(trip, Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid)
                    {
                        UnitOfWork.Rollback();
                        return View(model);
                    }
                    Repositories.Trips.Save(trip);
                    return RedirectToAction("Finish", new { id = trip.Id });
                }
            }
            throw new NotImplementedException();
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Finish(int id)
        {
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(Mapper.Map<Trip, ImportFinishedTripModel>(trip));
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Finalize(int id)
        {
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Import(trip); }
            return RedirectToAction("Index");
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult View(int id)
        {
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(Mapper.Map<Trip, ImportFinishedTripModel>(trip));
        }
    }
}
