using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Trips;
using System.Web.Mvc;
using TMD.Model.Trees;
using TMD.Application;
using TMD.Model;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Model.Locations;

namespace TMD.Models
{
    public enum ImportStep
    {
        Start = 1,
        Trip = 2,
        Sites = 3,
        Measurements = 4,
        Review = 5,
        Finish = 6
    }

    public class ImportModel
    {
        public ImportModel()
        { }

        public ImportStep CurrentStep { get; set; }

        public bool IsCurrentStepPremature
        {
            get { return !CanAdvanceToStep(CurrentStep); }
        }

        public bool IsStepAnAdvance(ImportStep step)
        {
            return (int)step > (int)CurrentStep;
        }

        public bool CanAdvanceToStep(ImportStep step)
        {
            switch (step)
            {
                case ImportStep.Start:
                case ImportStep.Trip:
                    return CurrentStep != ImportStep.Finish;
                case ImportStep.Sites:
                    return Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid 
                        && CurrentStep != ImportStep.Finish;
                case ImportStep.Measurements:
                    return CurrentStep != ImportStep.Finish
                        && Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid 
                        && Trip.AllSiteVisitsHaveSubsiteVisits
                        && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid;
                case ImportStep.Review:
                    return CurrentStep != ImportStep.Finish
                        && Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid
                        && Trip.AllSiteVisitsHaveSubsiteVisits
                        && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid
                        && Trip.AllSubsiteVisitsOfAllSiteVisitsHaveTreeMeasurements
                        && Trip.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid;
                case ImportStep.Finish:
                    return Trip.ValidateRegardingImport().IsValid;
                default:
                    return false;
            }
        }

        private Trip m_Trip;
        public Trip Trip
        {
            get
            {
                if (m_Trip == null)
                {
                    if (ApplicationSession.ImportTripId == -1)
                    {
                        m_Trip = Trip.Create();
                    }
                    else
                    {
                        m_Trip = TripService.FindById(ApplicationSession.ImportTripId);
                    }
                }
                return m_Trip;
            }
            set { m_Trip = value; }
        }

        public void SaveTrip()
        {
            using (UnitOfWork.BeginBusinessTransaction())
            {
                TripService.Save(Trip);
                UnitOfWork.Persist();
            }
            ApplicationSession.ImportTripId = Trip.Id;
        }

        public int SelectedMeasurementIndex
        {
            get { return ApplicationSession.ImportSelectedMeasurementIndex; }
            set { ApplicationSession.ImportSelectedMeasurementIndex = value; }
        }

        public int SelectedSubsiteVisitIndex
        {
            get { return ApplicationSession.ImportSelectedSubsiteVisitIndex; }
            set { ApplicationSession.ImportSelectedSubsiteVisitIndex = value; }
        }

        public SubsiteVisit SelectedSubsiteVisit
        {
            get { return SelectedSiteVisit.SubsiteVisits[SelectedSubsiteVisitIndex]; }
            set
            {
                if (value == null)
                {
                    SelectedSubsiteVisitIndex = -1;
                }
                else
                {
                    SelectedSubsiteVisitIndex = SelectedSiteVisit.SubsiteVisits.IndexOf(value);
                }
            }
        }

        public int SelectedSiteVisitIndex
        {
            get { return ApplicationSession.ImportSelectedSiteVisitIndex; }
            set { ApplicationSession.ImportSelectedSiteVisitIndex = value; }
        }

        public SiteVisit SelectedSiteVisit
        {
            get { return Trip.SiteVisits[SelectedSiteVisitIndex]; }
            set 
            {
                if (value == null)
                {
                    SelectedSiteVisitIndex = -1;
                }
                else
                {
                    SelectedSiteVisitIndex = Trip.SiteVisits.IndexOf(value); 
                }
            }
        }

        public IEnumerable<SelectListItem> BuildStateSelectList()
        {
            yield return new SelectListItem()
            {
                Text = string.Empty,
                Value = string.Empty
            };
            foreach (State s in LocationService.FindStatesByCountryCode("US"))
            {
                yield return new SelectListItem()
                {
                    Text = s.Name,
                    Value = s.Code
                };
            }
        }
    }
}