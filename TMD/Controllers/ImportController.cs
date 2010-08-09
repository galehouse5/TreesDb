﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Application;
using TMD.Model.Trips;
using TMD.Models;
using TMD.Extensions;
using TMD.Model;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Model.Trees;
using TMD.Model.Users;

namespace TMD.Controllers
{
    [UserAuthorizationFilter(Roles = UserRoles.Import)]
    public class ImportController : Controller
    {
        #region Trips

        [HttpGet]
        public ActionResult RemoveTrip(int tripIndex)
        {
            ImportsModel model = new ImportsModel();
            model.SelectedTrip = model.UserTripsNotYetImported[tripIndex];
            return PartialView("TripRemover", model);
        }

        [HttpDelete]
        [ActionName("Trip")]
        public ActionResult ConfirmRemoveTrip()
        {
            ImportsModel model = new ImportsModel();
            if (model.SelectedTrip != null)
            {
                model.RemoveSelectedTrip();
            }
            return new EmptyResult();
        }

        [HttpGet]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
        public ActionResult Index()
        {
            ImportsModel model = new ImportsModel();
            return View(model);
        }

        [HttpPost]
        public ActionResult StartNewImport()
        {
            ImportsModel model = new ImportsModel();
            model.SelectedTrip = model.CreateNewTrip();
            return RedirectToAction("Start");
        }

        [HttpPost]
        public ActionResult ContinueLastImport()
        {
            ImportsModel model = new ImportsModel();
            model.SelectedTrip = model.LastSavedTripNotYetImported;
            ImportModel importModel = new ImportModel();
            return RedirectToAction(importModel.SuggestedStep.ToString());
        }

        [HttpPost]
        public ActionResult ContinueNotYetFinishedImport(int tripIndex)
        {
            ImportsModel model = new ImportsModel();
            model.SelectedTrip = model.UserTripsNotYetImported[tripIndex];
            ImportModel importModel = new ImportModel();
            return RedirectToAction(importModel.SuggestedStep.ToString());
        }

        [HttpPost]
        public ActionResult DeleteNotYetFinishedImportImport(int tripIndex)
        {
            ImportsModel model = new ImportsModel();
            return View(model);
        }

        [HttpPost]
        public ActionResult ViewFinishedImport(int tripIndex)
        {
            ImportsModel model = new ImportsModel();
            model.SelectedTrip = model.UserTripsAlreadyImported[tripIndex];
            return RedirectToAction("Finish");
        }

        #endregion

        [HttpGet]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
        public ActionResult Start()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Start;
            if (model.IsImportFinished)
            {
                return RedirectToAction("Finish");
            }
            return View(model);
        }

        #region Trip actions

        [HttpGet]
        [ActionName("Trip")]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
        public ActionResult EditTrip()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Trip;
            if (model.CanAdvanceToCurrentStep)
            {
                return RedirectToAction("Start");
            }
            if (model.IsImportFinished)
            {
                return RedirectToAction("Finish");
            }
            return View("Trip", model);
        }

        [HttpPut]
        [ActionName("Trip")]
        public ActionResult SaveTrip(ImportModel model)
        {
            model.CurrentStep = ImportStep.Trip;
            if (model.CanAdvanceToCurrentStep)
            {
                return RedirectToAction("Start");
            }
            if (model.IsImportFinished)
            {
                return RedirectToAction("Finish");
            }
            model.Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
                .CopyToModelState(ModelState, "Trip");
            if (model.Trip.ValidateRegardingPersistence().IsValid)
            {
                model.SaveTrip();
            }
            return View("Trip", model);
        }

        [HttpPost]
        public ActionResult CreateTripMeasurer(ImportModel model)
        {
            if (model.Trip.Measurers.Count < 3)
            {
                model.Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
                    .CopyToModelState(ModelState, "Trip");
                model.Trip.AddMeasurer();
                if (model.Trip.ValidateRegardingPersistence().IsValid)
                {
                    model.SaveTrip();
                }
            }
            return View("Trip", model);
        }

        [HttpPost]
        public ActionResult RemoveTripMeasurer(ImportModel model)
        {
            if (model.Trip.Measurers.Count > 1)
            {
                model.Trip.Measurers.RemoveAt(model.Trip.Measurers.Count - 1);
                model.Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
                    .CopyToModelState(ModelState, "Trip");
                if (model.Trip.ValidateRegardingPersistence().IsValid)
                {
                    model.SaveTrip();
                }
            }
            return View("Trip", model);
        }

        #endregion

        #region SiteVisits actions

        [HttpGet]
        [ActionName("SiteVisits")]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
        public ActionResult EditSiteVisits()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.SiteVisits;
            if (model.CanAdvanceToCurrentStep)
            {
                return RedirectToAction("Trip");
            }
            if (model.IsImportFinished)
            {
                return RedirectToAction("Finish");
            }
            return View("SiteVisits", model);
        }

        [HttpGet]
        public ActionResult ValidateSiteVisits()
        {
            ImportModel model = new ImportModel();
            for (int sv = 0; sv < model.Trip.SiteVisits.Count; sv++)
            {
                if (!model.Trip.SiteVisits[sv]
                    .ValidateIgnoringCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
                {
                    ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}]", sv),
                        "You must edit this site visit to correct invalid or missing data.");
                }
                for (int ssv = 0; ssv < model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++)
                {
                    if (!model.Trip.SiteVisits[sv].SubsiteVisits[ssv]
                        .ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
                    {
                        ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv),
                            "You must edit this subsite visit to correct invalid or missing data.");
                    }
                }
            }
            model.Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
                .CopyToModelState(ModelState, "Trip");
            return View("SiteVisits", model);
        }

        #endregion

        #region SiteVisit actions

        [HttpPost]
        public ActionResult CreateSiteVisit()
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.AddSiteVisit();
            model.SaveTrip();
            return PartialView("SiteVisitEditor", model);
        }

        [HttpGet]
        [ActionName("SiteVisit")]
        public ActionResult EditSiteVisit(int siteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            return PartialView("SiteVisitEditor", model);
        }

        [HttpPut]
        [ActionName("SiteVisit")]
        public ActionResult SaveSiteVisit(ImportModel model)
        {
            ValidationResults siteVisitValidationResults = model.SelectedSiteVisit.ValidateIgnoringCoordinatesSubsiteVisitsTreeMeasurementsAndTreeMeasurers();
            if (!siteVisitValidationResults.IsValid)
            {
                ModelState.AddModelError("SelectedSiteVisit.HasErrors", "");
                siteVisitValidationResults.CopyToModelState(ModelState, "SelectedSiteVisit");
            }
            ValidationResults subsiteVisitsValidationResults = model.SelectedSiteVisit.ValidateIgnoringCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
                .FindAll(TagFilter.Ignore, "SiteVisit");
            if (!subsiteVisitsValidationResults.IsValid)
            {
                ModelState.AddModelError("SelectedSiteVisit.SubsiteVisits.HasErrors", "");
                subsiteVisitsValidationResults.CopyToModelState(ModelState, "SelectedSiteVisit");
            }
            for (int ssv = 0; ssv < model.SelectedSiteVisit.SubsiteVisits.Count; ssv++)
            {
                if (!model.SelectedSiteVisit.SubsiteVisits[ssv]
                    .ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
                {
                    ModelState.AddModelError(string.Format("SelectedSiteVisit.SubsiteVisits[{0}]", ssv),
                        "You must edit this subsite visit to correct invalid or missing data..");
                }
            }
            if (model.Trip.ValidateRegardingPersistence().IsValid)
            {
                model.SaveTrip();
            }
            return PartialView("SiteVisitEditor", model);
        }

        [HttpGet]
        public ActionResult RemoveSiteVisit(int siteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            return PartialView("SiteVisitRemover", model);
        }

        [HttpDelete]
        [ActionName("SiteVisit")]
        public ActionResult ConfirmRemoveSiteVisit()
        {
            ImportModel model = new ImportModel();
            if (model.SelectedSiteVisit != null) 
            {
                model.Trip.RemoveSiteVisit(model.SelectedSiteVisit);
                model.SelectedSiteVisit = null;
                model.SaveTrip();
            }
            return new EmptyResult();
        }

        [HttpGet]
        [ActionName("MapMarkersIgnoringSelectedSiteVisit")]
        public ActionResult GetMapMarkersIgnoringSelectedSiteVisit()
        {
            ImportModel model = new ImportModel();
            List<MapMarker> markers = new List<MapMarker>();
            foreach (SiteVisit sv in model.Trip.SiteVisits)
            {
                if (sv.Coordinates.IsSpecified && sv.CoordinatesEntered && sv != model.SelectedSiteVisit)
                {
                    markers.Add(sv.ToMapMarker());
                }
                foreach (SubsiteVisit ssv in sv.SubsiteVisits)
                {
                    if (ssv.Coordinates.IsSpecified && ssv.CoordinatesEntered)
                    {
                        markers.Add(ssv.ToMapMarker());
                    }
                    foreach (TreeMeasurementBase tm in ssv.TreeMeasurements)
                    {
                        if (tm.Coordinates.IsSpecified && tm.CoordinatesEntered)
                        {
                            markers.Add(tm.ToMapMarker());
                        }
                    }
                }
            }
            return Json(markers, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region SubsiteVisit actions

        [HttpPost]
        public ActionResult CreateSubsiteVisit()
        {
            ImportModel model = new ImportModel();
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.AddSubsiteVisit();
            model.SaveTrip();
            return PartialView("SubsiteVisitEditor", model);
        }

        [HttpDelete]
        [ActionName("SubsiteVisit")]
        public ActionResult ConfirmRemoveSubsiteVisit()
        {
            ImportModel model = new ImportModel();
            if (model.SelectedSubsiteVisit != null)
            {
                model.SelectedSiteVisit.RemoveSubsiteVisit(model.SelectedSubsiteVisit);
                model.SelectedSubsiteVisit = null;
                model.SaveTrip();
            }
            return new EmptyResult();
        }

        [HttpPut]
        [ActionName("SubsiteVisit")]
        public ActionResult SaveSubsiteVisit(ImportModel model)
        {
            model.SelectedSubsiteVisit.ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers()
                .CopyToModelState(ModelState, "SelectedSubsiteVisit");
            if (ModelState.IsValid)
            {
                model.SelectedSubsiteVisit.SetTripDefaults();
                model.SaveTrip();
            }
            return PartialView("SubsiteVisitEditor", model);
        }

        [HttpGet]
        [ActionName("SubsiteVisit")]
        public ActionResult EditSubsiteVisit(int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return PartialView("SubsiteVisitEditor", model);
        }

        [HttpGet]
        [ActionName("SubsiteVisitForSiteVisit")]
        public ActionResult EditSubsiteVisit(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return PartialView("SubsiteVisitEditor", model);
        }

        [HttpGet]
        public ActionResult RemoveSubsiteVisit(int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return PartialView("SubsiteVisitRemover", model);
        }

        [HttpGet]
        [ActionName("RemoveSubsiteVisitForSiteVisit")]
        public ActionResult RemoveSubsiteVisit(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return PartialView("SubsiteVisitRemover", model);
        }

        [HttpGet]
        [ActionName("MapMarkersIgnoringSelectedSubsiteVisit")]
        public ActionResult GetMapMarkersIgnoringSelectedSubsiteVisit()
        {
            ImportModel model = new ImportModel();
            List<MapMarker> markers = new List<MapMarker>();
            foreach (SiteVisit sv in model.Trip.SiteVisits)
            {
                if (sv.Coordinates.IsSpecified && sv.CoordinatesEntered)
                {
                    markers.Add(sv.ToMapMarker());
                }
                foreach (SubsiteVisit ssv in sv.SubsiteVisits)
                {
                    if (ssv.Coordinates.IsSpecified && ssv.CoordinatesEntered && ssv != model.SelectedSubsiteVisit)
                    {
                        markers.Add(ssv.ToMapMarker());
                    }
                    foreach (TreeMeasurementBase tm in ssv.TreeMeasurements)
                    {
                        if (tm.Coordinates.IsSpecified && tm.CoordinatesEntered)
                        {
                            markers.Add(tm.ToMapMarker());
                        }
                    }
                }
            }
            return Json(markers, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region TreeMeasurements actions

        [HttpGet]
        [ActionName("TreeMeasurements")]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
        public ActionResult EditTreeMeasurements()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.TreeMeasurements;
            if (model.CanAdvanceToCurrentStep)
            {
                return RedirectToAction("SiteVisits");
            }
            if (model.IsImportFinished)
            {
                return RedirectToAction("Finish");
            }
            return PartialView("TreeMeasurements", model);
        }

        [HttpGet]
        public ActionResult ValidateTreeMeasurements()
        {
            ImportModel model = new ImportModel();
            model.Trip.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().CopyToModelState(ModelState, "Trip");
            for (int sv = 0; sv < model.Trip.SiteVisits.Count; sv++)
            {
                for (int ssv = 0; ssv < model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++)
                {
                    for (int tm = 0; tm < model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements.Count; tm++)
                    {
                        if (!model.Trip.SiteVisits[sv].SubsiteVisits[ssv].TreeMeasurements[tm]
                            .ValidateRegardingScreeningAndPersistence().IsValid)
                        {
                            ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}].TreeMeasurements[{2}]", sv, ssv, tm),
                                "You must edit this tree measurement to correct invalid or missing data.");
                        }
                    }
                }
            }
            return View("TreeMeasurements", model);
        }

        #endregion

        #region TreeMeasurement actions

        [HttpPost]
        public ActionResult CreateSingleTrunkTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.AddSingleTrunkTreeMeasurement();
            model.SaveTrip();
            return PartialView("SingleTrunkTreeMeasurementEditor", model);
        }

        [HttpPost]
        public ActionResult CreateMultiTrunkTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.AddMultiTrunkTreeMeasurement();
            model.SaveTrip();
            return PartialView("MultiTrunkTreeMeasurementEditor", model);
        }

        [HttpGet]
        [ActionName("TreeMeasurement")]
        public ActionResult EditTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex, int treeMeasurementIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.TreeMeasurements[treeMeasurementIndex];
            model.SaveTrip();
            if (model.SelectedTreeMeasurement is MultiTrunkTreeMeasurement)
            {
                return PartialView("MultiTrunkTreeMeasurementEditor", model);
            }
            return PartialView("SingleTrunkTreeMeasurementEditor", model);
        }

        [HttpPut]
        [ActionName("TreeMeasurement")]
        public ActionResult SaveTreeMeasurement(ImportModel model)
        {
            ValidationResults results = model.SelectedTreeMeasurement.ValidateRegardingScreeningAndPersistence();
            results.CopyToModelState(ModelState, "SelectedTreeMeasurement");
            if (model.SelectedTreeMeasurement is MultiTrunkTreeMeasurement)
            {
                int i = 0;
                foreach (TrunkMeasurement tm in ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).TrunkMeasurements)
                {
                    if (!tm.ValidateRegardingScreeningAndPersistence().IsValid)
                    {
                        ModelState.AddModelError(string.Format("SelectedTreeMeasurement.TrunkMeasurements[{0}]", i),
                                "You must edit this trunk measurement to correct invalid or missing data.");
                    }
                    i++;
                }
            }
            if (ModelState.IsValid)
            {
                model.SelectedTreeMeasurement.SetTripDefaults();
                model.SaveTrip();
            }
            if (model.SelectedTreeMeasurement is MultiTrunkTreeMeasurement)
            {
                return PartialView("MultiTrunkTreeMeasurementEditor", model);
            }
            return PartialView("SingleTrunkTreeMeasurementEditor", model);
        }

        [HttpGet]
        public ActionResult RemoveTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex, int treeMeasurementIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.TreeMeasurements[treeMeasurementIndex];
            return PartialView("TreeMeasurementRemover", model);
        }

        [HttpDelete]
        [ActionName("TreeMeasurement")]
        public ActionResult ConfirmRemoveTreeMeasurement()
        {
            ImportModel model = new ImportModel();
            if (model.SelectedTreeMeasurement != null)
            {
                model.SelectedSubsiteVisit.RemoveTreeMeasurement(model.SelectedTreeMeasurement);
                model.SelectedTreeMeasurement = null;
                model.SaveTrip();
            }
            return new EmptyResult();
        }

        [HttpGet]
        [ActionName("MapMarkersIgnoringSelectedTreeMeasurement")]
        public ActionResult GetMapMarkersIgnoringSelectedTreeMeasurement()
        {
            ImportModel model = new ImportModel();
            List<MapMarker> markers = new List<MapMarker>();
            foreach (SiteVisit sv in model.Trip.SiteVisits)
            {
                if (sv.Coordinates.IsSpecified && sv.CoordinatesEntered)
                {
                    markers.Add(sv.ToMapMarker());
                }
                foreach (SubsiteVisit ssv in sv.SubsiteVisits)
                {
                    if (ssv.Coordinates.IsSpecified && ssv.CoordinatesEntered)
                    {
                        markers.Add(ssv.ToMapMarker());
                    }
                    foreach (TreeMeasurementBase tm in ssv.TreeMeasurements)
                    {
                        if (tm.Coordinates.IsSpecified && tm.CoordinatesEntered && tm != model.SelectedTreeMeasurement)
                        {
                            markers.Add(tm.ToMapMarker());
                        }
                    }
                }
            }
            return Json(markers, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult FindSimilarCommonNames(string term)
        {
            IList<KnownTree> knownTrees = TreeService.FindTreesWithSimilarCommonName(term, 5);
            List<object> autocompleteResults = new List<object>();
            foreach (KnownTree kt in knownTrees)
            {
                autocompleteResults.Add(new
                {
                    label = string.Format("{0} ({1})", kt.CommonName.ToTitleCase(), kt.ScientificName),
                    value = kt.CommonName.ToTitleCase(),
                    scientificName = kt.ScientificName
                });
            }
            return this.Json(autocompleteResults, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Review actions

        [HttpGet]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
        public ActionResult Review()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Review;
            if (model.CanAdvanceToCurrentStep)
            {
                return RedirectToAction("TreeMeasurements");
            }
            if (model.IsImportFinished)
            {
                return RedirectToAction("Finish");
            }
            model.Trip.ValidateRegardingImport().CopyToModelState(ModelState, "Trip");
            model.Trip.ValidateRegardingOptionalRules().CopyToModelState(ModelState, "Trip", "Warning");
            return View("Review", model);
        }

        #endregion

        #region Finish actions

        [HttpPost]
        [ActionName("Finish")]
        public ActionResult FinishImport()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Finish;
            if (model.CanAdvanceToCurrentStep)
            {
                return RedirectToAction("Review");
            }
            if (model.IsImportFinished)
            {
                return RedirectToAction("Finish");
            }
            model.FinishImport();
            return View("Finish", model);
        }

        [HttpGet]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
        public ActionResult Finish()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Finish;
            if (model.CanAdvanceToCurrentStep || !model.IsImportFinished)
            {
                return RedirectToAction("Review");
            }
            return View("Finish", model);
        }

        #endregion

        #region TrunkMeasurement actions

        [HttpPost]
        public ActionResult CreateTrunkMeasurement()
        {
            ImportModel model = new ImportModel();
            model.SelectedTrunkMeasurement = ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).AddTrunkMeasurement();
            model.SaveTrip();
            return PartialView("TrunkMeasurementEditor", model);
        }

        [HttpGet]
        [ActionName("TrunkMeasurement")]
        public ActionResult EditTrunkMeasurement(int trunkMeasurementIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedTrunkMeasurement = ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).TrunkMeasurements[trunkMeasurementIndex];
            return PartialView("TrunkMeasurementEditor", model);
        }

        [HttpPut]
        [ActionName("TrunkMeasurement")]
        public ActionResult SaveTrunkMeasurement(ImportModel model)
        {
            ValidationResults results = model.SelectedTrunkMeasurement.ValidateRegardingScreeningAndPersistence();
            results.CopyToModelState(ModelState, "SelectedTrunkMeasurement");
            if (ModelState.IsValid)
            {
                model.SaveTrip();
            }
            return PartialView("TrunkMeasurementEditor", model);
        }

        [HttpGet]
        public ActionResult RemoveTrunkMeasurement(int trunkMeasurementIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedTrunkMeasurement = ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).TrunkMeasurements[trunkMeasurementIndex];
            return PartialView("TrunkMeasurementRemover", model);
        }

        [HttpDelete]
        [ActionName("TrunkMeasurement")]
        public ActionResult ConfirmRemoveTrunkMeasurement()
        {
            ImportModel model = new ImportModel();
            if (model.SelectedTrunkMeasurement != null)
            {
                ((MultiTrunkTreeMeasurement)model.SelectedTreeMeasurement).RemoveTrunkMeasurement(model.SelectedTrunkMeasurement);
                model.SelectedTrunkMeasurement = null;
                model.SaveTrip();
            }
            return new EmptyResult();
        }

        #endregion
    }
}
