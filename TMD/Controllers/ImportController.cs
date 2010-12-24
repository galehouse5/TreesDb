using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Trips;
using TMD.Models;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Trees;
using TMD.Model.Users;
using TMD.Model.Extensions;
using TMD.Model.Validation;
using AutoMapper;
using TMD.Model.Photos;
using System.Diagnostics;
using TMD.Binders;

namespace TMD.Controllers
{
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
        public ActionResult History()
        {
            return View(Repositories.Trips.ListCreatedByUser(User.Id));
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Start(int id = 0)
        {
            var trip = id == 0 ? Model.Trips.Trip.Create() : Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(trip);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Start()
        {
            var trip = Model.Trips.Trip.Create();
            using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Save(trip); }
            return RedirectToAction("Trip", new { id = trip.Id });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trip(int id)
        {
            Trip trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var model = new ImportTripModel(); 
            Mapper.Map<Trip, ImportTripModel>(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trip(ImportTripModel model)
        {
            var trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            Mapper.Map<ImportTripModel, Trip>(model, trip);
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
            Mapper.Map<Trip, ImportSitesModel>(trip, model);
            return View(model);
        }

        [DebuggerDisplay("{Action} {Level} with Id {Id}")]
        public class InnerAction : IModelBinder
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
                return new InnerAction
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
            [ModelBinder(typeof(InnerAction))] InnerAction innerAction)
        {
            ModelState.Clear();
            var trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.BeginAndPersist())
            {
                ensureTripHasASite(trip);
                ensureTripSitesHaveASubsite(trip);
                if (innerAction.Equals(InnerAction.EntityLevel.Trip, InnerAction.EntityAction.Save))
                {
                    Mapper.Map<ImportSitesModel, Trip>(model, trip);
                    this.ValidateMappedModel<Trip, ImportSitesModel>(trip, Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) 
                    {
                        UnitOfWork.Rollback();
                        return View(model); 
                    } 
                    Repositories.Trips.Save(trip);
                    return RedirectToAction("Trees", new { id = trip.Id });
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Trip, InnerAction.EntityAction.Add))
                {
                    var site = trip.AddSiteVisit();
                    ensureTripSitesHaveASubsite(trip);
                    Repositories.Trips.Save(trip); UnitOfWork.Flush();
                    model.Sites.Add(Mapper.Map<SiteVisit, ImportSiteModel>(site));
                    ensureSitesAreSaveableAndRemovable(model);
                    return Request.IsAjaxRequest() ? (model.Sites.Count > 2 ? PartialView("SitePartialById", model).AddViewData("siteId", site.Id) : PartialView("SitesPartial", model)) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Save))
                {
                    var siteModel = model.FindSiteById(innerAction.Id);
                    var site = trip.FindSiteVisitById(innerAction.Id);
                    Mapper.Map<ImportSiteModel, SiteVisit>(siteModel, site);
                    this.ValidateMappedModel<SiteVisit, ImportSiteModel>(site, string.Format("Sites[{0}].", model.Sites.IndexOf(siteModel)), Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) 
                    {
                        UnitOfWork.Rollback();
                        return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", innerAction.Id) : View(model); 
                    }
                    Repositories.Trips.Save(trip);
                    siteModel.IsEditing = false;
                    return Request.IsAjaxRequest() ?  PartialView("SitePartialById", model).AddViewData("siteId", innerAction.Id) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Remove))
                {
                    model.Sites.Remove(model.FindSiteById(innerAction.Id));
                    trip.RemoveSiteVisit(trip.FindSiteVisitById(innerAction.Id));
                    ensureSitesAreSaveableAndRemovable(model);
                    return Request.IsAjaxRequest() ? (ActionResult)PartialView("SitesPartial", model) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Edit))
                {
                    model.FindSiteById(innerAction.Id).IsEditing = true;
                    return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", innerAction.Id) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Add))
                {
                    var siteModel = model.FindSiteById(innerAction.Id);
                    var site = trip.FindSiteVisitById(innerAction.Id);
                    var subsite = site.AddSubsiteVisit();
                    Repositories.Trips.Save(trip); UnitOfWork.Flush();
                    Mapper.Map<ImportSiteModel, SiteVisit>(siteModel, site);
                    Mapper.Map<SiteVisit, ImportSiteModel>(site, siteModel);
                    return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", siteModel.Id) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Subsite, InnerAction.EntityAction.Remove))
                {
                    var subsite = trip.FindSubsiteVisitById(innerAction.Id);
                    subsite.SiteVisit.RemoveSubsiteVisit(subsite);
                    var siteModel = model.FindSiteById(subsite.SiteVisit.Id);
                    siteModel.Subsites.Remove(siteModel.FindSubsiteById(innerAction.Id));
                    Repositories.Trips.Save(trip);
                    return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", siteModel.Id) : View(model);
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
            Mapper.Map<Trip, ImportTreesModel>(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trees(
            [ModelBinder(typeof(ImportTreesModelBinder))] ImportTreesModel model, 
            [ModelBinder(typeof(InnerAction))] InnerAction innerAction)
        {
            ModelState.Clear();
            var trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.BeginAndPersist())
            {
                ensureTripSubsitesHaveATree(trip);
                if (innerAction.Equals(InnerAction.EntityLevel.Tree, InnerAction.EntityAction.Save))
                {
                    var tree = trip.FindTreeMeasurementById(innerAction.Id);
                    var treeModel = model.FindTreeById(innerAction.Id);
                    Mapper.Map<ImportTreeModel, TreeMeasurementBase>(treeModel, tree);
                    var subsiteModel = model.FindSubsiteContainingTreeWithId(innerAction.Id);
                    var siteModel = model.FindSiteContainingTreeWithId(innerAction.Id);
                    this.ValidateMappedModel<TreeMeasurementBase, ImportTreeModel>(tree, string.Format(
                        "Sites[{0}].Subsites[{1}].Trees[{2}].", model.Sites.IndexOf(siteModel), siteModel.Subsites.IndexOf(subsiteModel), subsiteModel.Trees.IndexOf(treeModel)),
                        Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) 
                    { 
                        UnitOfWork.Rollback(); 
                        return View(model); 
                    }
                    Repositories.Trips.Save(trip);
                    treeModel.IsEditing = false;
                    return View(model);
                }
            }
            throw new NotImplementedException();
        }
    }
}
