using System;
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
    [SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute]
    public class ImportController : Controller
    {
        public ActionResult Index()
        {
            return RedirectToAction("Start");
        }

        public ActionResult Start()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Start;
            return View(model);
        }

        #region Trip actions

        [HttpGet]
        [ActionName("Trip")]
        public ActionResult EditTrip()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Trip;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("Start");
            }
            return View("Trip", model);
        }

        [HttpPut]
        [ActionName("Trip")]
        public ActionResult SaveTrip(ImportModel model)
        {
            model.CurrentStep = ImportStep.Trip;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("Start");
            }
            model.Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
                .CopyToModelState(ModelState, "Trip");
            if (ModelState.IsValid)
            {
                model.SaveTrip();
            }
            return View("Trip", model);
        }

        #endregion

        #region SiteVisits actions

        [HttpGet]
        [ActionName("SiteVisits")]
        public ActionResult EditSiteVisits()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Sites;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("Trip");
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
                        "This site visit contains invalid data.");
                }
                for (int ssv = 0; ssv < model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++)
                {
                    if (!model.Trip.SiteVisits[sv].SubsiteVisits[ssv]
                        .ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
                    {
                        ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv),
                            "This subsite visit contains invalid data.");
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
            return View("SiteVisit", model);
        }

        [HttpGet]
        [ActionName("SiteVisit")]
        public ActionResult EditSiteVisit(int siteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            return View("SiteVisit", model);
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
                        "This subsite visit contains invalid data.");
                }
            }
            if (model.Trip.ValidateRegardingPersistence().IsValid)
            {
                model.SaveTrip();
            }
            return View("SiteVisit", model);
        }

        [HttpGet]
        public ActionResult RemoveSiteVisit(int siteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            return View(model);
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
                    foreach (TreeMeasurement tm in ssv.TreeMeasurements)
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
            return View("SubsiteVisit", model);
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
                model.SaveTrip();
            }
            return View("SubsiteVisit", model);
        }

        [HttpGet]
        [ActionName("SubsiteVisit")]
        public ActionResult EditSubsiteVisit(int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return View("SubsiteVisit", model);
        }

        [HttpGet]
        [ActionName("SubsiteVisitForSiteVisit")]
        public ActionResult EditSubsiteVisit(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return View("SubsiteVisit", model);
        }

        [HttpGet]
        public ActionResult RemoveSubsiteVisit(int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return View(model);
        }

        [HttpGet]
        [ActionName("RemoveSubsiteVisitForSiteVisit")]
        public ActionResult RemoveSubsiteVisit(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return View("RemoveSubsiteVisit", model);
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
                    foreach (TreeMeasurement tm in ssv.TreeMeasurements)
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
        public ActionResult EditTreeMeasurements()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Measurements;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("SiteVisits");
            }
            return View("TreeMeasurements", model);
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
                                "This tree measurement contains invalid data.");
                        }
                    }
                }
            }
            return View("TreeMeasurements", model);
        }

        #endregion

        #region TreeMeasurement actions

        [HttpPost]
        public ActionResult CreateTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.AddTreeMeasurement();
            model.SelectedTreeMeasurement.AddMeasurer();
            model.SaveTrip();
            return View("TreeMeasurement", model);
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
            return View("TreeMeasurement", model);
        }

        [HttpPut]
        [ActionName("TreeMeasurement")]
        public ActionResult SaveTreeMeasurement(ImportModel model)
        {
            ValidationResults results = model.SelectedTreeMeasurement.ValidateRegardingScreeningAndPersistence();
            results.CopyToModelState(ModelState, "SelectedTreeMeasurement");
            if (ModelState.IsValid)
            {
                model.SaveTrip();
            }
            return View("TreeMeasurement", model);
        }

        [HttpGet]
        public ActionResult RemoveTreeMeasurement(int siteVisitIndex, int subsiteVisitIndex, int treeMeasurementIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            model.SelectedTreeMeasurement = model.SelectedSubsiteVisit.TreeMeasurements[treeMeasurementIndex];
            return View(model);
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
                    foreach (TreeMeasurement tm in ssv.TreeMeasurements)
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
        public ActionResult AutocompleteCommonName(string term)
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

        [HttpPost]
        public ActionResult CreateTreeMeasurementMeasurer(ImportModel model)
        {
            if (model.SelectedTreeMeasurement.Measurers.Count < 3)
            {
                model.SelectedTreeMeasurement.ValidateRegardingPersistence()
                    .CopyToModelState(ModelState, "SelectedTreeMeasurement");
                if (ModelState.IsValid)
                {
                    model.SelectedTreeMeasurement.AddMeasurer();
                    model.SaveTrip();
                }
            }
            return View("TreeMeasurement", model);
        }

        [HttpPost]
        public ActionResult RemoveTreeMeasurementMeasurer(ImportModel model)
        {
            if (model.SelectedTreeMeasurement.Measurers.Count > 1)
            {
                model.SelectedTreeMeasurement.ValidateRegardingPersistence()
                    .CopyToModelState(ModelState, "SelectedTreeMeasurement");
                if (ModelState.IsValid)
                {
                    model.SelectedTreeMeasurement.Measurers.RemoveAt(model.SelectedTreeMeasurement.Measurers.Count - 1);
                    model.SaveTrip();
                }
            }
            return View("TreeMeasurement", model);
        }

        #endregion

        #region Review actions

        [HttpGet]
        public ActionResult Review()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Review;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("TreeMeasurements");
            }
            model.Trip.ValidateRegardingImport().CopyToModelState(ModelState, "Trip");
            model.Trip.ValidateRegardingOptionalRules().CopyToModelState(ModelState, "Trip", "Warning");
            return View("Review", model);
        }

        #endregion

        #region Finish actions

        [HttpGet]
        public ActionResult Finish()
        {
            ImportModel model = new ImportModel();
            model.CurrentStep = ImportStep.Finish;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("Review");
            }
            return View("Finish", model);
        }

        #endregion
    }
}
