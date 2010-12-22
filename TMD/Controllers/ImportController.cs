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
            Model.Trips.Trip trip = id == 0 ? Model.Trips.Trip.Create() : Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            return View(trip);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Start()
        {
            Trip trip = Model.Trips.Trip.Create();
            using (UnitOfWork.Begin()) { Repositories.Trips.Save(trip); UnitOfWork.Persist(); }
            return RedirectToAction("Trip", new { id = trip.Id });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trip(int id)
        {
            Model.Trips.Trip trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var model = new ImportTripModel(); 
            Mapper.Map<Model.Trips.Trip, ImportTripModel>(trip, model);
            return View(model);
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Trip(ImportTripModel model)
        {
            Model.Trips.Trip trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            Mapper.Map<ImportTripModel, Model.Trips.Trip>(model, trip);
            this.ValidateMappedModel<Model.Trips.Trip, ImportTripModel>(trip, Tag.Screening, Tag.Persistence);
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            using (UnitOfWork.Begin()) { Repositories.Trips.Save(trip); UnitOfWork.Persist(); }
            return RedirectToAction("Sites", new { id = trip.Id });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Sites(int id)
        {
            Model.Trips.Trip trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.Begin())
            {
                ensureTripHasASite(trip);
                ensureTripSitesHaveASubsite(trip);
                UnitOfWork.Persist();
            }
            var model = new ImportSitesModel();
            Mapper.Map<Model.Trips.Trip, ImportSitesModel>(trip, model);
            return View(model);
        }

        [DebuggerDisplay("{Action} {Level} with Id {Id}")]
        public class InnerAction : IModelBinder
        {
            public enum EntityLevel { Unknown, Trip, Site, Subsite, Tree }
            public enum EntityAction { Unknown, Add, Save, Edit, Remove }

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

        private class SitesModelBinder : DefaultModelBinder
        {
            public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
            {
                var model = (ImportSitesModel)base.BindModel(controllerContext, bindingContext);
                Model.Trips.Trip trip = Repositories.Trips.FindById(model.Id);
                model.Sites.Where(s => !s.IsEditing).ForEach(s =>
                    Mapper.Map<Model.Trips.SiteVisit, ImportSiteModel>(trip.SiteVisits.First(sv => sv.Id == s.Id), s));
                return model;
            }
        }

        [HttpPost, AuthorizeUser(Roles = UserRoles.Import)]
        public ActionResult Sites(
            [ModelBinder(typeof(SitesModelBinder))] ImportSitesModel model, 
            [ModelBinder(typeof(InnerAction))] InnerAction innerAction)
        {
            ModelState.Clear();
            Model.Trips.Trip trip = Repositories.Trips.FindById(model.Id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            using (UnitOfWork.Begin())
            {
                ensureTripHasASite(trip);
                ensureTripSitesHaveASubsite(trip);
                if (innerAction.Equals(InnerAction.EntityLevel.Trip, InnerAction.EntityAction.Save))
                {
                    Mapper.Map<ImportSitesModel, Model.Trips.Trip>(model, trip);
                    this.ValidateMappedModel<Model.Trips.Trip, ImportSitesModel>(trip, Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) { UnitOfWork.Persist(); return View(model); } 
                    Repositories.Trips.Save(trip); UnitOfWork.Persist();
                    return RedirectToAction("Trees", new { id = trip.Id });
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Trip, InnerAction.EntityAction.Add))
                {
                    var site = trip.AddSiteVisit();
                    ensureTripSitesHaveASubsite(trip);
                    Repositories.Trips.Save(trip); UnitOfWork.Persist();
                    model.Sites.Add(Mapper.Map<Model.Trips.SiteVisit, ImportSiteModel>(site));
                    ensureSitesAreSaveableAndRemovable(model);
                    return Request.IsAjaxRequest() ? (model.Sites.Count > 2 ? PartialView("SitePartialById", model).AddViewData("siteId", site.Id) : PartialView("SitesPartial", model)) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Save))
                {
                    var siteModel = model.Sites.First(s => s.Id == innerAction.Id);
                    var site = trip.SiteVisits.First(s => s.Id == innerAction.Id);
                    Mapper.Map<ImportSiteModel, Model.Trips.SiteVisit>(siteModel, site);
                    this.ValidateMappedModel<Model.Trips.SiteVisit, ImportSiteModel>(site, string.Format("Sites[{0}].", model.Sites.IndexOf(siteModel)), Tag.Screening, Tag.Persistence);
                    if (!ModelState.IsValid) { UnitOfWork.Persist(); return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", innerAction.Id) : View(model); }
                    Repositories.Trips.Save(trip); UnitOfWork.Persist();
                    siteModel.IsEditing = false;
                    return Request.IsAjaxRequest() ?  PartialView("SitePartialById", model).AddViewData("siteId", innerAction.Id) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Remove))
                {
                    model.Sites.RemoveAll(s => s.Id == innerAction.Id);
                    trip.SiteVisits.RemoveAll(s => s.Id == innerAction.Id);
                    ensureSitesAreSaveableAndRemovable(model); UnitOfWork.Persist(); 
                    return Request.IsAjaxRequest() ? (ActionResult)PartialView("SitesPartial", model) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Edit))
                {
                    model.Sites.First(s => s.Id == innerAction.Id).IsEditing = true;
                    return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", innerAction.Id) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Site, InnerAction.EntityAction.Add))
                {
                    var siteModel = model.Sites.First(s => s.Id == innerAction.Id);
                    var site = trip.SiteVisits.First(s => s.Id == innerAction.Id);
                    var subsite = site.AddSubsiteVisit();
                    Repositories.Trips.Save(trip); UnitOfWork.Persist();
                    Mapper.Map<ImportSiteModel, Model.Trips.SiteVisit>(siteModel, site);
                    Mapper.Map<Model.Trips.SiteVisit, ImportSiteModel>(site, siteModel);
                    return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", siteModel.Id) : View(model);
                }
                if (innerAction.Equals(InnerAction.EntityLevel.Subsite, InnerAction.EntityAction.Remove))
                {
                    var siteModel = model.Sites.First(s => s.Subsites.Contains(ss => ss.Id == innerAction.Id));
                    model.Sites.ForEach(s => s.Subsites.RemoveAll(ss => ss.Id == innerAction.Id));
                    trip.SiteVisits.ForEach(s => s.SubsiteVisits.RemoveAll(ss => ss.Id == innerAction.Id));
                    Repositories.Trips.Save(trip); UnitOfWork.Persist();
                    return Request.IsAjaxRequest() ? PartialView("SitePartialById", model).AddViewData("siteId", siteModel.Id) : View(model);
                }
            }
            throw new NotImplementedException();
        }

        //[HttpPost, AuthorizeUser(Roles = UserRole.Import)]
        //public ActionResult Trip(Trip t)
        //{
        //    Trip t = Repositories.Trips.FindById(id);
        //    if (t.IsValidToPersist())
        //    {

        //    }


        //    t.Validate(
        //    if (ModelState.IsValid)
        //    {

        //    }
        //    return View(t);
        //}


        //[DefaultReturnUrl]
        //public ActionResult Index()
        //{
        //    IList<Trip> model = TripRepository.FindTripsCreatedByUser(User.Id);
        //    return View(model);
        //}

        //[HttpPost]
        //public ActionResult Create()
        //{
        //    Trip model = Model.Trips.Trip.Create();
        //    using (UnitOfWork.BeginBusinessTransaction())
        //    {
        //        TripRepository.Save(model);
        //        UnitOfWork.Persist();
        //    }
        //    return RedirectToAction("Start", new { id = model.Id });
        //}

        //public ActionResult Start(int id)
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripRepository.FindById(id),
        //        CurrentStep = ImportStep.Start
        //    };
        //    if (model.Trip.Creator != User)
        //    {
        //        return new UnauthorizedResult();
        //    }
        //    return View(model);
        //}

        //public ActionResult Continue(int id)
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripRepository.FindById(id)
        //    };
        //    model.CurrentStep = model.SuggestedStep;
        //    return RedirectToAction(model.SuggestedStep.ToString(), new { id = model.Trip.Id });
        //}

        //public ActionResult Trip(int id)
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripRepository.FindById(id),
        //        CurrentStep = ImportStep.Start
        //    };
        //    if (model.Trip.Creator != User)
        //    {
        //        return new UnauthorizedResult();
        //    }
        //    return View(model);
        //}

        //[HttpGet]
        //public ActionResult DeleteTrip(int id)
        //{
        //    Trip model = TripService.FindById(id);
        //    if (model == null)
        //    {
        //        return new NotFoundResult();
        //    }
        //    if (model.Creator != User)
        //    {
        //        return new UnauthorizedResult();
        //    }
        //    return PartialView("DeleteTrip", model);
        //}







        //[HttpGet]
        //public ActionResult RemoveTrip(int tripIndex)
        //{
        //    Trip model = TripService.FindNotYetImportedTripsByUserId(UserSession.User.Id)[tripIndex];
        //    Session.ImportTripId = model.Id;
        //    return PartialView("TripRemover", model);
        //}

        //[HttpDelete]
        //[ActionName("Trip")]
        //public ActionResult ConfirmRemoveTrip()
        //{
        //    Trip model = TripService.FindById(Session.ImportTripId);
        //    if (model != null)
        //    {
        //        using (UnitOfWork.BeginBusinessTransaction())
        //        {
        //            TripService.Remove(model);
        //            UnitOfWork.Persist();
        //        }
        //    }
        //    return new EmptyResult();
        //}



        //[HttpPost]
        //public ActionResult StartNewImport()
        //{
        //    Trip model = Trip.Create();
        //    model.AddMeasurer();
        //    using (UnitOfWork.BeginBusinessTransaction())
        //    {
        //        TripService.Save(model);
        //        UnitOfWork.Persist();
        //    }
        //    Session.ImportTripId = model.Id;
        //    return RedirectToAction("Start");
        //}

        //[HttpPost]
        //public ActionResult ContinueLastImport()
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripService.FindLastSavedTripByUserId(User.Id)
        //    };
        //    model.Trip = model.Trip.IsImported ? null : model.Trip;
        //    Session.ImportTripId = model.Trip.Id;
        //    return RedirectToAction(model.SuggestedStep.ToString());
        //}

        //[HttpPost]
        //public ActionResult ContinueNotYetFinishedImport(int tripIndex)
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripService.FindNotYetImportedTripsByUserId(User.Id)[tripIndex]
        //    };
        //    model.Trip = model.Trip.IsImported ? null : model.Trip;
        //    Session.ImportTripId = model.Trip.Id;
        //    return RedirectToAction(model.SuggestedStep.ToString());
        //}

        //[HttpPost]
        //public ActionResult ViewFinishedImport(int tripIndex)
        //{
        //    Trip model = TripService.FindAlreadyImportedTripsByUserId(User.Id)[tripIndex];
        //    Session.ImportTripId = model.Id;
        //    return RedirectToAction("Finish");
        //}

        //#endregion

        //[HttpGet]
        //[SetDefaultControllerAndActionFilter]
        //public ActionResult Start()
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripService.FindById(Session.ImportTripId),
        //        CurrentStep = ImportStep.Start
        //    };
        //    if (model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Finish");
        //    }
        //    return View(model);
        //}

        //#region Trip actions

        //[HttpGet]
        //[ActionName("Trip")]
        //[SetDefaultControllerAndActionFilter]
        //public ActionResult EditTrip()
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripService.FindById(Session.ImportTripId),
        //        CurrentStep = ImportStep.Trip
        //    };
        //    if (model.IsCurrentStepPremature)
        //    {
        //        return RedirectToAction("Start");
        //    }
        //    if (model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Finish");
        //    }
        //    return View("Trip", model);
        //}

        //[HttpPut]
        //[ActionName("Trip")]
        //public ActionResult SaveTrip(ImportStepModel model)
        //{
        //    model.Trip = TripService.FindById(Session.ImportTripId).CopyPublicPropertyValuesFrom<Trip>(model.Trip);
        //    model.CurrentStep = ImportStep.Trip;
        //    if (model.IsCurrentStepPremature)
        //    {
        //        return RedirectToAction("Start");
        //    }
        //    if (model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Finish");
        //    }
        //    model.Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
        //        .CopyToModelState(ModelState, "Trip");
        //    if (model.Trip.ValidateRegardingPersistence().IsValid)
        //    {
        //        using (UnitOfWork.BeginBusinessTransaction())
        //        {
        //            TripService.Save(model.Trip);
        //            UnitOfWork.Persist();
        //        }
        //    }
        //    return View("Trip", model);
        //}

        //[HttpPost]
        //public ActionResult CreateTripMeasurer(ImportStepModel model)
        //{
        //    model.Trip = TripService.FindById(Session.ImportTripId);
        //    model.CurrentStep = ImportStep.Trip;
        //    if (model.Trip.Measurers.Count < 3)
        //    {
        //        model.Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
        //            .CopyToModelState(ModelState, "Trip");
        //        model.Trip.AddMeasurer();
        //        if (model.Trip.ValidateRegardingPersistence().IsValid)
        //        {
        //            using (UnitOfWork.BeginBusinessTransaction())
        //            {
        //                TripService.Save(model.Trip);
        //                UnitOfWork.Persist();
        //            }
        //        }
        //    }
        //    return View("Trip", model);
        //}

        //[HttpPost]
        //public ActionResult RemoveTripMeasurer(ImportStepModel model)
        //{
        //    model.Trip = TripService.FindById(Session.ImportTripId);
        //    model.CurrentStep = ImportStep.Trip;
        //    if (model.Trip.Measurers.Count > 1)
        //    {
        //        model.Trip.Measurers.RemoveAt(model.Trip.Measurers.Count - 1);
        //        model.Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
        //            .CopyToModelState(ModelState, "Trip");
        //        if (model.Trip.ValidateRegardingPersistence().IsValid)
        //        {
        //            using (UnitOfWork.BeginBusinessTransaction())
        //            {
        //                TripService.Save(model.Trip);
        //                UnitOfWork.Persist();
        //            }
        //        }
        //    }
        //    return View("Trip", model);
        //}

        //#endregion

        //#region SiteVisits actions

        //[HttpGet]
        //[ActionName("SiteVisits")]
        //[SetDefaultControllerAndActionFilter]
        //public ActionResult EditSiteVisits()
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripService.FindById(Session.ImportTripId),
        //        CurrentStep = ImportStep.SiteVisits
        //    };
        //    if (model.IsCurrentStepPremature)
        //    {
        //        return RedirectToAction("Trip");
        //    }
        //    if (model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Finish");
        //    }
        //    return View("SiteVisits", model);
        //}

        //[HttpGet]
        //public ActionResult ValidateSiteVisits()
        //{
        //    ImportStepModel model = new ImportStepModel()
        //    {
        //        Trip = TripService.FindById(Session.ImportTripId),
        //        CurrentStep = ImportStep.Trip
        //    };
        //    for (int sv = 0; sv < model.Trip.SiteVisits.Count; sv++)
        //    {
        //        if (!model.Trip.SiteVisits[sv]
        //            .ValidateIgnoringCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
        //        {
        //            ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}]", sv),
        //                "You must edit this site visit to correct invalid or missing data.");
        //        }
        //        for (int ssv = 0; ssv < model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++)
        //        {
        //            if (!model.Trip.SiteVisits[sv].SubsiteVisits[ssv]
        //                .ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
        //            {
        //                ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv),
        //                    "You must edit this subsite visit to correct invalid or missing data.");
        //            }
        //        }
        //    }
        //    model.Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
        //        .CopyToModelState(ModelState, "Trip");
        //    return View("SiteVisits", model);
        //}

        //#endregion

        //#region SiteVisit actions

        //[HttpPost]
        //public ActionResult CreateSiteVisit()
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.AddSiteVisit();
        //    model.SaveTrip();
        //    return PartialView("SiteVisitEditor", model);
        //}

        //[HttpGet]
        //[ActionName("SiteVisit")]
        //public ActionResult EditSiteVisit(int siteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    return PartialView("SiteVisitEditor", model);
        //}

        //[HttpPut]
        //[ActionName("SiteVisit")]
        //public ActionResult SaveSiteVisit(ImportModel model)
        //{
        //    ValidationResults siteVisitValidationResults = model.SelectedSiteVisit.ValidateIgnoringCoordinatesSubsiteVisitsTreeMeasurementsAndTreeMeasurers();
        //    if (!siteVisitValidationResults.IsValid)
        //    {
        //        ModelState.AddModelError("SelectedSiteVisit.HasErrors", "");
        //        siteVisitValidationResults.CopyToModelState(ModelState, "SelectedSiteVisit");
        //    }
        //    ValidationResults subsiteVisitsValidationResults = model.SelectedSiteVisit.ValidateIgnoringCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
        //        .FindAll(TagFilter.Ignore, "SiteVisit");
        //    if (!subsiteVisitsValidationResults.IsValid)
        //    {
        //        ModelState.AddModelError("SelectedSiteVisit.SubsiteVisits.HasErrors", "");
        //        subsiteVisitsValidationResults.CopyToModelState(ModelState, "SelectedSiteVisit");
        //    }
        //    for (int ssv = 0; ssv < model.SelectedSiteVisit.SubsiteVisits.Count; ssv++)
        //    {
        //        if (!model.SelectedSiteVisit.SubsiteVisits[ssv]
        //            .ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
        //        {
        //            ModelState.AddModelError(string.Format("SelectedSiteVisit.SubsiteVisits[{0}]", ssv),
        //                "You must edit this subsite visit to correct invalid or missing data..");
        //        }
        //    }
        //    if (model.Trip.ValidateRegardingPersistence().IsValid)
        //    {
        //        model.SaveTrip();
        //    }
        //    return PartialView("SiteVisitEditor", model);
        //}

        //[HttpGet]
        //public ActionResult RemoveSiteVisit(int siteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    return PartialView("SiteVisitRemover", model);
        //}

        //[HttpDelete]
        //[ActionName("SiteVisit")]
        //public ActionResult ConfirmRemoveSiteVisit()
        //{
        //    ImportModel model = new ImportModel();
        //    if (model.SelectedSiteVisit != null) 
        //    {
        //        model.Trip.RemoveSiteVisit(model.SelectedSiteVisit);
        //        model.SelectedSiteVisit = null;
        //        model.SaveTrip();
        //    }
        //    return new EmptyResult();
        //}

        //[HttpGet]
        //[ActionName("MapMarkersIgnoringSelectedSiteVisit")]
        //public ActionResult GetMapMarkersIgnoringSelectedSiteVisit()
        //{
        //    ImportModel model = new ImportModel();
        //    List<MapMarker> markers = new List<MapMarker>();
        //    foreach (SiteVisit sv in model.Trip.SiteVisits)
        //    {
        //        if (sv.Coordinates.IsSpecified && sv.CoordinatesEntered && sv != model.SelectedSiteVisit)
        //        {
        //            markers.Add(sv.ToMapMarker());
        //        }
        //        foreach (SubsiteVisit ssv in sv.SubsiteVisits)
        //        {
        //            if (ssv.Coordinates.IsSpecified && ssv.CoordinatesEntered)
        //            {
        //                markers.Add(ssv.ToMapMarker());
        //            }
        //            foreach (TreeMeasurementBase tm in ssv.TreeMeasurements)
        //            {
        //                if (tm.Coordinates.IsSpecified && tm.CoordinatesEntered)
        //                {
        //                    markers.Add(tm.ToMapMarker());
        //                }
        //            }
        //        }
        //    }
        //    return Json(markers, JsonRequestBehavior.AllowGet);
        //}

        //#endregion

        //#region SubsiteVisit actions

        //[HttpPost]
        //public ActionResult CreateSubsiteVisit()
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.AddSubsiteVisit();
        //    model.SaveTrip();
        //    return PartialView("SubsiteVisitEditor", model);
        //}

        //[HttpDelete]
        //[ActionName("SubsiteVisit")]
        //public ActionResult ConfirmRemoveSubsiteVisit()
        //{
        //    ImportModel model = new ImportModel();
        //    if (model.SelectedSubsiteVisit != null)
        //    {
        //        model.SelectedSiteVisit.RemoveSubsiteVisit(model.SelectedSubsiteVisit);
        //        model.SelectedSubsiteVisit = null;
        //        model.SaveTrip();
        //    }
        //    return new EmptyResult();
        //}

        //[HttpPut]
        //[ActionName("SubsiteVisit")]
        //public ActionResult SaveSubsiteVisit(ImportModel model)
        //{
        //    model.SelectedSubsiteVisit.ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers()
        //        .CopyToModelState(ModelState, "SelectedSubsiteVisit");
        //    if (ModelState.IsValid)
        //    {
        //        model.SelectedSubsiteVisit.SetTripDefaults();
        //        model.SaveTrip();
        //    }
        //    return PartialView("SubsiteVisitEditor", model);
        //}

        //[HttpGet]
        //[ActionName("SubsiteVisit")]
        //public ActionResult EditSubsiteVisit(int subsiteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    return PartialView("SubsiteVisitEditor", model);
        //}

        //[HttpGet]
        //[ActionName("SubsiteVisitForSiteVisit")]
        //public ActionResult EditSubsiteVisit(int siteVisitIndex, int subsiteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    return PartialView("SubsiteVisitEditor", model);
        //}

        //[HttpGet]
        //public ActionResult RemoveSubsiteVisit(int subsiteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    return PartialView("SubsiteVisitRemover", model);
        //}

        //[HttpGet]
        //[ActionName("RemoveSubsiteVisitForSiteVisit")]
        //public ActionResult RemoveSubsiteVisit(int siteVisitIndex, int subsiteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    return PartialView("SubsiteVisitRemover", model);
        //}

        //[HttpGet]
        //[ActionName("MapMarkersIgnoringSelectedSubsiteVisit")]
        //public ActionResult GetMapMarkersIgnoringSelectedSubsiteVisit()
        //{
        //    ImportModel model = new ImportModel();
        //    List<MapMarker> markers = new List<MapMarker>();
        //    foreach (SiteVisit sv in model.Trip.SiteVisits)
        //    {
        //        if (sv.Coordinates.IsSpecified && sv.CoordinatesEntered)
        //        {
        //            markers.Add(sv.ToMapMarker());
        //        }
        //        foreach (SubsiteVisit ssv in sv.SubsiteVisits)
        //        {
        //            if (ssv.Coordinates.IsSpecified && ssv.CoordinatesEntered && ssv != model.SelectedSubsiteVisit)
        //            {
        //                markers.Add(ssv.ToMapMarker());
        //            }
        //            foreach (TreeMeasurementBase tm in ssv.TreeMeasurements)
        //            {
        //                if (tm.Coordinates.IsSpecified && tm.CoordinatesEntered)
        //                {
        //                    markers.Add(tm.ToMapMarker());
        //                }
        //            }
        //        }
        //    }
        //    return Json(markers, JsonRequestBehavior.AllowGet);
        //}

        //#endregion

        //#region TreeMeasurements actions

        //[HttpGet]
        //[ActionName("TreeMeasurements")]
        //[SetDefaultControllerAndActionFilter]
        //public ActionResult EditTreeMeasurements()
        //{
        //    ImportModel model = new ImportModel();
        //    model.CurrentStep = ImportStep.TreeMeasurements;
        //    if (model.CanAdvanceToCurrentStep)
        //    {
        //        return RedirectToAction("SiteVisits");
        //    }
        //    if (model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Finish");
        //    }
        //    return PartialView("TreeMeasurements", model);
        //}

        //[HttpGet]
        //public ActionResult ValidateTreeMeasurements()
        //{
        //    ImportModel model = new ImportModel();
        //    model.Trip.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().CopyToModelState(ModelState, "Trip");
        //    for (int sv = 0; sv < model.Trip.SiteVisits.Count; sv++)
        //    {
        //        for (int ssv = 0; ssv < model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++)
        //        {
        //            for (int tm = 0; tm < model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count; tm++)
        //            {
        //                if (!model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm]
        //                    .ValidateRegardingScreeningAndPersistence().IsValid)
        //                {
        //                    ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", sv, ssv, tm),
        //                        "You must edit this tree measurement to correct invalid or missing data.");
        //                }
        //            }
        //        }
        //    }
        //    return View("TreeMeasurements", model);
        //}

        //#endregion

        //#region TreeMeasurement actions

        //[HttpPost]
        //public ActionResult CreateSingleTrunkTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.AddSingleTrunkTreeMeasurement();
        //    model.SaveTrip();
        //    return PartialView("SingleTrunkTreeMeasurementEditor", model);
        //}

        //[HttpPost]
        //public ActionResult CreateMultiTrunkTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.AddMultiTrunkTreeMeasurement();
        //    model.SaveTrip();
        //    return PartialView("MultiTrunkTreeMeasurementEditor", model);
        //}

        //[HttpGet]
        //[ActionName("TreeMeasurement")]
        //public ActionResult EditTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex, int treeMeasurementIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.TreeMeasurements[treeMeasurementIndex];
        //    model.SaveTrip();
        //    if (model.SelectedTreeMeasurement is MultiTrunkTreeMeasurement)
        //    {
        //        return PartialView("MultiTrunkTreeMeasurementEditor", model);
        //    }
        //    return PartialView("SingleTrunkTreeMeasurementEditor", model);
        //}

        //[HttpPut]
        //[ActionName("TreeMeasurement")]
        //public ActionResult SaveTreeMeasurement(ImportModel model)
        //{
        //    ValidationResults results = model.SelectedTreeMeasurement.ValidateRegardingScreeningAndPersistence();
        //    results.CopyToModelState(ModelState, "SelectedTreeMeasurement");
        //    if (model.SelectedTreeMeasurement is MultiTrunkTreeMeasurement)
        //    {
        //        int i = 0;
        //        foreach (TrunkMeasurement tm in ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).TrunkMeasurements)
        //        {
        //            if (!tm.ValidateRegardingScreeningAndPersistence().IsValid)
        //            {
        //                ModelState.AddModelError(string.Format("SelectedTreeMeasurement.TrunkMeasurements[{0}]", i),
        //                        "You must edit this trunk measurement to correct invalid or missing data.");
        //            }
        //            i++;
        //        }
        //    }
        //    if (ModelState.IsValid)
        //    {
        //        model.SelectedTreeMeasurement.SetTripDefaults();
        //        model.SaveTrip();
        //    }
        //    if (model.SelectedTreeMeasurement is MultiTrunkTreeMeasurement)
        //    {
        //        return PartialView("MultiTrunkTreeMeasurementEditor", model);
        //    }
        //    return PartialView("SingleTrunkTreeMeasurementEditor", model);
        //}

        //[HttpGet]
        //public ActionResult RemoveTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex, int treeMeasurementIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
        //    model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
        //    model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.TreeMeasurements[treeMeasurementIndex];
        //    return PartialView("TreeMeasurementRemover", model);
        //}

        //[HttpDelete]
        //[ActionName("TreeMeasurement")]
        //public ActionResult ConfirmRemoveTreeMeasurement()
        //{
        //    ImportModel model = new ImportModel();
        //    if (model.SelectedTreeMeasurement != null)
        //    {
        //        model.SelectedSubsiteVisit.RemoveTreeMeasurement(model.SelectedTreeMeasurement);
        //        model.SelectedTreeMeasurement = null;
        //        model.SaveTrip();
        //    }
        //    return new EmptyResult();
        //}

        //[HttpGet]
        //[ActionName("MapMarkersIgnoringSelectedTreeMeasurement")]
        //public ActionResult GetMapMarkersIgnoringSelectedTreeMeasurement()
        //{
        //    ImportModel model = new ImportModel();
        //    List<MapMarker> markers = new List<MapMarker>();
        //    foreach (SiteVisit sv in model.Trip.SiteVisits)
        //    {
        //        if (sv.Coordinates.IsSpecified && sv.CoordinatesEntered)
        //        {
        //            markers.Add(sv.ToMapMarker());
        //        }
        //        foreach (SubsiteVisit ssv in sv.SubsiteVisits)
        //        {
        //            if (ssv.Coordinates.IsSpecified && ssv.CoordinatesEntered)
        //            {
        //                markers.Add(ssv.ToMapMarker());
        //            }
        //            foreach (TreeMeasurementBase tm in ssv.TreeMeasurements)
        //            {
        //                if (tm.Coordinates.IsSpecified && tm.CoordinatesEntered && tm != model.SelectedTreeMeasurement)
        //                {
        //                    markers.Add(tm.ToMapMarker());
        //                }
        //            }
        //        }
        //    }
        //    return Json(markers, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //public ActionResult FindSimilarCommonNames(string term)
        //{
        //    IList<KnownTree> knownTrees = TreeService.FindTreesWithSimilarCommonName(term, 5);
        //    List<object> autocompleteResults = new List<object>();
        //    foreach (KnownTree kt in knownTrees)
        //    {
        //        autocompleteResults.Add(new
        //        {
        //            label = string.Format("{0} ({1})", kt.CommonName.ToTitleCase(), kt.ScientificName),
        //            value = kt.CommonName.ToTitleCase(),
        //            scientificName = kt.ScientificName
        //        });
        //    }
        //    return this.Json(autocompleteResults, JsonRequestBehavior.AllowGet);
        //}

        //#endregion

        //#region Review actions

        //[HttpGet]
        //[SetDefaultControllerAndActionFilter]
        //public ActionResult Review()
        //{
        //    ImportModel model = new ImportModel();
        //    model.CurrentStep = ImportStep.Review;
        //    if (model.CanAdvanceToCurrentStep)
        //    {
        //        return RedirectToAction("TreeMeasurements");
        //    }
        //    if (model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Finish");
        //    }
        //    model.Trip.ValidateRegardingImport().CopyToModelState(ModelState, "Trip");
        //    model.Trip.ValidateRegardingOptionalRules().CopyToModelState(ModelState, "Trip", "Warning");
        //    return View("Review", model);
        //}

        //#endregion

        //#region Finish actions

        //[HttpPost]
        //[ActionName("Finish")]
        //public ActionResult FinishImport()
        //{
        //    ImportModel model = new ImportModel();
        //    model.CurrentStep = ImportStep.Finish;
        //    if (model.CanAdvanceToCurrentStep)
        //    {
        //        return RedirectToAction("Review");
        //    }
        //    if (model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Finish");
        //    }
        //    model.FinishImport();
        //    return View("Finish", model);
        //}

        //[HttpGet]
        //[SetDefaultControllerAndActionFilter]
        //public ActionResult Finish()
        //{
        //    ImportModel model = new ImportModel();
        //    model.CurrentStep = ImportStep.Finish;
        //    if (model.CanAdvanceToCurrentStep || !model.Trip.IsImported)
        //    {
        //        return RedirectToAction("Review");
        //    }
        //    return View("Finish", model);
        //}

        //#endregion

        //#region TrunkMeasurement actions

        //[HttpPost]
        //public ActionResult CreateTrunkMeasurement()
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedTrunkMeasurement = ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).AddTrunkMeasurement();
        //    model.SaveTrip();
        //    return PartialView("TrunkMeasurementEditor", model);
        //}

        //[HttpGet]
        //[ActionName("TrunkMeasurement")]
        //public ActionResult EditTrunkMeasurement(int trunkMeasurementIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedTrunkMeasurement = ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).TrunkMeasurements[trunkMeasurementIndex];
        //    return PartialView("TrunkMeasurementEditor", model);
        //}

        //[HttpPut]
        //[ActionName("TrunkMeasurement")]
        //public ActionResult SaveTrunkMeasurement(ImportModel model)
        //{
        //    ValidationResults results = model.SelectedTrunkMeasurement.ValidateRegardingScreeningAndPersistence();
        //    results.CopyToModelState(ModelState, "SelectedTrunkMeasurement");
        //    if (ModelState.IsValid)
        //    {
        //        model.SaveTrip();
        //    }
        //    return PartialView("TrunkMeasurementEditor", model);
        //}

        //[HttpGet]
        //public ActionResult RemoveTrunkMeasurement(int trunkMeasurementIndex)
        //{
        //    ImportModel model = new ImportModel();
        //    model.SelectedTrunkMeasurement = ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).TrunkMeasurements[trunkMeasurementIndex];
        //    return PartialView("TrunkMeasurementRemover", model);
        //}

        //[HttpDelete]
        //[ActionName("TrunkMeasurement")]
        //public ActionResult ConfirmRemoveTrunkMeasurement()
        //{
        //    ImportModel model = new ImportModel();
        //    if (model.SelectedTrunkMeasurement != null)
        //    {
        //        ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).RemoveTrunkMeasurement(model.SelectedTrunkMeasurement);
        //        model.SelectedTrunkMeasurement = null;
        //        model.SaveTrip();
        //    }
        //    return new EmptyResult();
        //}

        //#endregion
    }
}
