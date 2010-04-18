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

            model.Sites = new List<ImportSiteModel>();
            foreach (SiteVisit sv in model.Entity.ListSiteVisists())
            {
                ImportSiteModel ism = new ImportSiteModel();
                ism.Entity = sv;
                ism.FillModelFromEntity();
                ism.Subsites = new List<ImportSubsiteModel>();
                model.Sites.Add(ism);
                foreach (SubsiteVisit ssv in sv.ListSubsiteVisists())
                {
                    ImportSubsiteModel issm = new ImportSubsiteModel();
                    issm.Entity = ssv;
                    issm.FillModelFromEntity();
                    ism.Subsites.Add(issm);
                }
            }

            if (model.IsCurrentStepPremature)
            {
                return RedirectToAction("TripInfo");
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
    }
}
