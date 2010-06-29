using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Application;
using TMD.Model.Trips;
using TMD.Models;
using TMD.Extensions;

namespace TMD.Controllers
{
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

        [HttpPost]
        public ActionResult CreateSiteVisit()
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.AddSiteVisit();
            model.SaveTrip();
            return View("SiteVisitStep1", model);
        }

        [HttpGet]
        [ActionName("SiteVisit")]
        public ActionResult EditSiteVisitStep1(int siteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            return View("SiteVisitStep1", model);
        }

        [HttpPut]
        [ActionName("SiteVisit")]
        public ActionResult SaveSiteVisitStep1(ImportModel model)
        {
            model.SelectedSiteVisit.ValidateIgnoringCoordinatesSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
                .CopyToModelState(ModelState, "SelectedSiteVisit");
            if (ModelState.IsValid)
            {
                model.SaveTrip();
            }
            return View("SiteVisitStep1", model);
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
        [ActionName("SiteVisitStep2")]
        public ActionResult EditSiteVisitStep2()
        {
            ImportModel model = new ImportModel();
            return View("SiteVisitStep2", model);
        }

        [HttpGet]
        [ActionName("SiteVisitStep1")]
        public ActionResult EditSiteVisitStep1()
        {
            ImportModel model = new ImportModel();
            return View("SiteVisitStep1", model);
        }

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
        [ActionName("SubsiteVisitIndependent")]
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
        [ActionName("RemoveSubsiteVisitIndependent")]
        public ActionResult RemoveSubsiteVisit(int siteVisitIndex, int subsiteVisitIndex)
        {
            ImportModel model = new ImportModel();
            model.SelectedSiteVisit = model.Trip.SiteVisits[siteVisitIndex];
            model.SelectedSubsiteVisit = model.SelectedSiteVisit.SubsiteVisits[subsiteVisitIndex];
            return View("RemoveSubsiteVisit", model);
        }

        [HttpGet]
        public ActionResult ValidateSiteVisit()
        {
            ImportModel model = new ImportModel();
            for (int ssv = 0; ssv < model.SelectedSiteVisit.SubsiteVisits.Count; ssv++)
            {
                if (!model.SelectedSiteVisit.SubsiteVisits[ssv]
                    .ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
                {
                    ModelState.AddModelError(string.Format("SelectedSiteVisit.SubsiteVisits[{0}]", ssv),
                        "You must edit or remove this subsite visit to fix invalid data.");
                }
            }
            model.SelectedSiteVisit.ValidateIgnoringCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
                .CopyToModelState(ModelState, "SelectedSiteVisit");
            return View("SiteVisitStep2", model);
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
                        "You must edit or remove this site visit to fix invalid data.");
                }
                for (int ssv = 0; ssv < model.Trip.SiteVisits[sv].SubsiteVisits.Count; ssv++)
                {
                    if (!model.Trip.SiteVisits[sv].SubsiteVisits[ssv]
                        .ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
                    {
                        ModelState.AddModelError(string.Format("Trip.SiteVisits[{0}].SubsiteVisits[{1}]", sv, ssv),
                            "You must edit or remove this subsite visit to fix invalid data.");
                    }
                }
            }
            model.Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
                .CopyToModelState(ModelState, "Trip");
            return View("SiteVisits", model);
        }
    }
}
