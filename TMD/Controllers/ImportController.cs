using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Application;
using TMD.Model.Trips;
using TMD.Extensions;
using TMD.Models;
using TMD.Model.Sites;
using TMD.Model.Trees;

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
            ImportTripModel model = new ImportTripModel();
            model.Entity = ApplicationSession.ImportTrip;
            model.CurrentStep = EImportStep.Start;
            return View(model);
        }

        public ActionResult TripInfo()
        {
            ImportTripModel model = new ImportTripModel();
            model.Entity = ApplicationSession.ImportTrip;
            model.CurrentStep = EImportStep.TripInfo;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("Start");
            }
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult TripInfo(ImportTripModel model)
        {
            model.Entity = ApplicationSession.ImportTrip;
            model.CurrentStep = EImportStep.TripInfo;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("Start");
            }
            model.FillEntityFromModel();
            return new EmptyResult();
        }

        public ActionResult SiteInfo()
        {
            ImportTripModel model = new ImportTripModel();
            model.Entity = ApplicationSession.ImportTrip;
            model.CurrentStep = EImportStep.SiteInfo;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("TripInfo");
            }
            model.Sites = new List<ImportSiteModel>();
            foreach (SiteVisit sv in model.Entity.ListSiteVisists())
            {
                ImportSiteModel ism = new ImportSiteModel();
                ism.Entity = sv;
                ism.FillModelFromEntity();
                model.Sites.Add(ism);
                foreach (SubsiteVisit ssv in sv.ListSubsiteVisists())
                {
                    ImportSubsiteModel issm = new ImportSubsiteModel();
                    issm.Entity = ssv;
                    issm.FillModelFromEntity();
                    ism.Subsites.Add(issm);
                }
            }
            return View(model);
        }

        public ActionResult DeleteSiteDialog(Guid siteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            ImportSiteModel model = new ImportSiteModel();
            model.Entity = sv;
            model.FillModelFromEntity();
            return View(model);            
        }

        [HttpPost]
        public ActionResult ConfirmDeleteSite(Guid siteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            ApplicationSession.ImportTrip.RemoveSiteVisit(sv);
            return new EmptyResult();
        }

        public ActionResult DeleteSubsiteDialog(Guid siteId, Guid subsiteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(subsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", subsiteId.ToString()));
            }
            ImportSubsiteModel model = new ImportSubsiteModel();
            model.Entity = ssv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult ConfirmDeleteSubsite(Guid siteId, Guid subsiteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(subsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", subsiteId.ToString()));
            }
            sv.RemoveSubsiteVisit(ssv);
            return new EmptyResult();
        }

        public ActionResult AddSiteDialog()
        {
            SiteVisit sv = SiteVisit.Create(Site.Create());
            ImportSiteModel model = new ImportSiteModel();
            model.Entity = sv;
            return View(model);
        }

        public ActionResult AddSubsiteDialog(Guid siteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = SubsiteVisit.Create(Subsite.Create());
            ImportSubsiteModel issm = new ImportSubsiteModel();
            issm.Entity = ssv;
            issm.SiteVisit = sv;
            issm.FillModelFromEntity();
            return View(issm);
        }

        public ActionResult EditSiteDialog(Guid siteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            ImportSiteModel model = new ImportSiteModel();
            model.Entity = sv;
            model.FillModelFromEntity();
            return View(model);
        }

        public ActionResult EditSubsiteDialog(Guid siteId, Guid subsiteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(subsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", subsiteId.ToString()));
            }
            ImportSubsiteModel model = new ImportSubsiteModel();
            model.Entity = ssv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult SaveAddSiteDialog(ImportSiteModel model)
        {
            SiteVisit sv = SiteVisit.Create(Site.Create());
            model.Entity = sv;
            model.FillEntityFromModel();
            ApplicationSession.ImportTrip.AddSiteVisist(sv);
            model.FillModelFromEntity();
            return this.Json(new {
                siteId = model.Id.ToString(),
                siteName = model.Name
            });
        }

        [HttpPost]
        public ActionResult SaveAddSubsiteDialog(ImportSubsiteModel model)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(model.SiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", model.SiteId.ToString()));
            }
            SubsiteVisit ssv = SubsiteVisit.Create(Subsite.Create());
            model.Entity = ssv;
            model.FillEntityFromModel();
            sv.AddSubsiteVisit(ssv);
            model.SiteVisit = sv;
            model.FillModelFromEntity();
            return this.Json(new {
                siteId = model.SiteId.ToString(),
                subsiteId = model.Id.ToString(),
                subsiteName = model.Name
            });
        }

        [HttpPost]
        public ActionResult SaveEditSiteDialog(ImportSiteModel model)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(model.Id);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", model.Id.ToString()));
            }
            model.Entity = sv;
            model.FillEntityFromModel();
            model.FillModelFromEntity();
            return this.Json(new {
                siteId = model.Id.ToString(),
                siteName = model.Name
            });
        }

        [HttpPost]
        public ActionResult SaveEditSubsiteDialog(ImportSubsiteModel model)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(model.SiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", model.SiteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(model.Id);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", model.Id.ToString()));
            }
            model.Entity = ssv;
            model.FillEntityFromModel();
            model.SiteVisit = sv;
            model.FillModelFromEntity();
            return this.Json(new {
                siteId = model.SiteId.ToString(),
                subsiteId = model.Id.ToString(),
                subsiteName = model.Name
            });
        }

        public ActionResult Measurements()
        {
            ImportTripModel model = new ImportTripModel();
            model.Entity = ApplicationSession.ImportTrip;
            model.CurrentStep = EImportStep.Measurements;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("SiteInfo");
            }
            model.Sites = new List<ImportSiteModel>();
            foreach (SiteVisit sv in model.Entity.ListSiteVisists())
            {
                ImportSiteModel ism = new ImportSiteModel();
                ism.Entity = sv;
                ism.FillModelFromEntity();
                foreach (Tree t in sv.ListMeasuredTrees())
                {
                    ImportMeasurementModel imm = new ImportMeasurementModel();
                    imm.Entity = t;
                    imm.FillModelFromEntity();
                    ism.Measurements.Add(imm);
                }
                foreach (SubsiteVisit ssv in sv.ListSubsiteVisists())
                {
                    ImportSubsiteModel issm = new ImportSubsiteModel();
                    issm.Entity = ssv;
                    issm.FillModelFromEntity();
                    ism.Subsites.Add(issm);
                    foreach (Tree t in ssv.ListMeasuredTrees())
                    {
                        ImportMeasurementModel imm = new ImportMeasurementModel();
                        imm.Entity = t;
                        imm.FillModelFromEntity();
                        issm.Measurements.Add(imm);
                    }
                }
                model.Sites.Add(ism);
            }
            return View(model);
        }

        public ActionResult AddSiteMeasurementDialog(Guid siteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            Tree t = Tree.Create();
            ImportMeasurementModel model = new ImportMeasurementModel();
            model.Entity = t;
            model.SiteVisit = sv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult SaveAddSiteMeasurementDialog(ImportMeasurementModel model)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(model.SiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", model.SiteId.ToString()));
            }
            Tree t = Tree.Create();
            model.Entity = t;
            model.SiteVisit = sv;
            model.FillEntityFromModel();
            model.FillModelFromEntity();
            sv.AddMeasuredTree(t);
            return this.Json(new {
                siteId = model.SiteId,
                measurementId = model.Id,
                genus = model.Genus,
                species = model.Species,
                commonName = model.CommonName
            });
        }

        public ActionResult EditSiteMeasurementDialog(Guid siteId, Guid measurementId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            Tree t = sv.GetMeasuredTreeById(measurementId);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", measurementId.ToString()));
            }
            ImportMeasurementModel model = new ImportMeasurementModel();
            model.Entity = t;
            model.SiteVisit = sv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult SaveEditSiteMeasurementDialog(ImportMeasurementModel model)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(model.SiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", model.SiteId.ToString()));
            }
            Tree t = sv.GetMeasuredTreeById(model.Id);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", model.Id.ToString()));
            }
            model.Entity = t;
            model.SiteVisit = sv;
            model.FillEntityFromModel();
            model.FillModelFromEntity();
            return this.Json(new {
                siteId = model.SiteId,
                measurementId = model.Id,
                genus = model.Genus,
                species = model.Species,
                commonName = model.CommonName
            });
        }

        public ActionResult DeleteSiteMeasurementDialog(Guid siteId, Guid measurementId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            Tree t = sv.GetMeasuredTreeById(measurementId);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", measurementId.ToString()));
            }
            ImportMeasurementModel model = new ImportMeasurementModel();
            model.Entity = t;
            model.SiteVisit = sv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult ConfirmDeleteSiteMeasurement(Guid siteId, Guid measurementId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            Tree t = sv.GetMeasuredTreeById(measurementId);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", measurementId.ToString()));
            }
            sv.RemoveMeasuredTree(t);
            return new EmptyResult();
        }

        public ActionResult AddSubsiteMeasurementDialog(Guid siteId, Guid subsiteId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(subsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", subsiteId.ToString()));
            }
            Tree t = Tree.Create();
            ImportMeasurementModel model = new ImportMeasurementModel();
            model.Entity = t;
            model.SiteVisit = sv;
            model.SubsiteVisit = ssv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult SaveAddSubsiteMeasurementDialog(ImportMeasurementModel model)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(model.SiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", model.SiteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(model.SubsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", model.SubsiteId.ToString()));
            }
            Tree t = Tree.Create();
            model.Entity = t;
            model.SiteVisit = sv;
            model.SubsiteVisit = ssv;
            model.FillEntityFromModel();
            model.FillModelFromEntity();
            ssv.AddMeasuredTree(t);
            return this.Json(new
            {
                siteId = model.SiteId,
                subsiteId = model.SubsiteId,
                measurementId = model.Id,
                genus = model.Genus,
                species = model.Species,
                commonName = model.CommonName
            });
        }

        public ActionResult EditSubsiteMeasurementDialog(Guid siteId, Guid subsiteId, Guid measurementId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(subsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", subsiteId.ToString()));
            }
            Tree t = ssv.GetMeasuredTreeById(measurementId);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", measurementId.ToString()));
            }
            ImportMeasurementModel model = new ImportMeasurementModel();
            model.Entity = t;
            model.SiteVisit = sv;
            model.SubsiteVisit = ssv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult SaveEditSubsiteMeasurementDialog(ImportMeasurementModel model)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(model.SiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", model.SiteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(model.SubsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", model.SubsiteId.ToString()));
            }
            Tree t = ssv.GetMeasuredTreeById(model.Id);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", model.Id.ToString()));
            }
            model.Entity = t;
            model.SiteVisit = sv;
            model.SubsiteVisit = ssv;
            model.FillEntityFromModel();
            model.FillModelFromEntity();
            return this.Json(new
            {
                siteId = model.SiteId,
                subsiteId = model.SubsiteId,
                measurementId = model.Id,
                genus = model.Genus,
                species = model.Species,
                commonName = model.CommonName
            });
        }

        public ActionResult DeleteSubsiteMeasurementDialog(Guid siteId, Guid subsiteId, Guid measurementId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(subsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", subsiteId.ToString()));
            }
            Tree t = ssv.GetMeasuredTreeById(measurementId);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", measurementId.ToString()));
            }
            ImportMeasurementModel model = new ImportMeasurementModel();
            model.Entity = t;
            model.SiteVisit = sv;
            model.SubsiteVisit = ssv;
            model.FillModelFromEntity();
            return View(model);
        }

        [HttpPost]
        public ActionResult ConfirmDeleteSubsiteMeasurement(Guid siteId, Guid subsiteId, Guid measurementId)
        {
            SiteVisit sv = ApplicationSession.ImportTrip.GetSiteVisitById(siteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid siteId '{0}'.", siteId.ToString()));
            }
            SubsiteVisit ssv = sv.GetSubsiteVisitById(subsiteId);
            if (sv == null)
            {
                throw new ApplicationException(string.Format("Invalid subsiteId '{0}'.", subsiteId.ToString()));
            }
            Tree t = ssv.GetMeasuredTreeById(measurementId);
            if (t == null)
            {
                throw new ApplicationException(string.Format("Invalid measurementId '{0}'.", measurementId.ToString()));
            }
            ssv.RemoveMeasuredTree(t);
            return new EmptyResult();
        }

        public ActionResult Review()
        {
            ImportTripModel model = new ImportTripModel();
            model.Entity = ApplicationSession.ImportTrip;
            model.CurrentStep = EImportStep.Review;
            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("Measurements");
            }
            model.Sites = new List<ImportSiteModel>();
            foreach (SiteVisit sv in model.Entity.ListSiteVisists())
            {
                ImportSiteModel ism = new ImportSiteModel();
                ism.Entity = sv;
                ism.FillModelFromEntity();
                foreach (Tree t in sv.ListMeasuredTrees())
                {
                    ImportMeasurementModel imm = new ImportMeasurementModel();
                    imm.Entity = t;
                    imm.FillModelFromEntity();
                    ism.Measurements.Add(imm);
                }
                foreach (SubsiteVisit ssv in sv.ListSubsiteVisists())
                {
                    ImportSubsiteModel issm = new ImportSubsiteModel();
                    issm.Entity = ssv;
                    issm.FillModelFromEntity();
                    ism.Subsites.Add(issm);
                    foreach (Tree t in ssv.ListMeasuredTrees())
                    {
                        ImportMeasurementModel imm = new ImportMeasurementModel();
                        imm.Entity = t;
                        imm.FillModelFromEntity();
                        issm.Measurements.Add(imm);
                    }
                }
                model.Sites.Add(ism);
            }
            return View(model);
        }

        public ActionResult Finish()
        {
            ImportTripModel model = new ImportTripModel();
            model.Entity = ApplicationSession.ImportTrip;
            model.CurrentStep = EImportStep.Finish;
            if (model.IsCurrentStepPremature)
            {
                //return RedirectToAction("Review");
            }
            model.FillModelFromEntity();
            ApplicationSession.ImportTrip = Trip.Create();
            return View(model);
        }
    }
}
