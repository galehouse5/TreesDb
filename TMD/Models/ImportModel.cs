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
                    m_Trip = TripService.FindById(ApplicationSession.ImportTripId);
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

        public TreeMeasurement SelectedTreeMeasurement
        {
            get { return ApplicationSession.ImportSelectedMeasurementIndex > -1 ? SelectedSubsiteVisit.TreeMeasurements[ApplicationSession.ImportSelectedMeasurementIndex] : null; }
            set { ApplicationSession.ImportSelectedMeasurementIndex = value == null ? -1 : SelectedSubsiteVisit.TreeMeasurements.IndexOf(value); }
        }

        public SubsiteVisit SelectedSubsiteVisit
        {
            get { return ApplicationSession.ImportSelectedSubsiteVisitIndex > -1 ? SelectedSiteVisit.SubsiteVisits[ApplicationSession.ImportSelectedSubsiteVisitIndex] : null; }
            set { ApplicationSession.ImportSelectedSubsiteVisitIndex = value == null ? -1 : SelectedSiteVisit.SubsiteVisits.IndexOf(value); }
        }

        public SiteVisit SelectedSiteVisit
        {
            get { return ApplicationSession.ImportSelectedSiteVisitIndex > -1 ? Trip.SiteVisits[ApplicationSession.ImportSelectedSiteVisitIndex] : null; }
            set { ApplicationSession.ImportSelectedSiteVisitIndex = value == null ? -1 : Trip.SiteVisits.IndexOf(value); }
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