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
        SiteVisits = 3,
        TreeMeasurements = 4,
        Review = 5,
        Finish = 6
    }

    public class ImportModel
    {
        public ImportStep CurrentStep { get; set; }

        public bool CanAdvanceToCurrentStep
        {
            get { return !CanAdvanceToStep(CurrentStep); }
        }

        public bool IsStepAnAdvance(ImportStep step)
        {
            return (int)step > (int)CurrentStep;
        }

        public bool CanAdvanceToStep(ImportStep step)
        {
            if (Trip == null && step != ImportStep.Start)
            {
                return false;
            }
            switch (step)
            {
                case ImportStep.Start:
                case ImportStep.Trip:
                    return CurrentStep != ImportStep.Finish;
                case ImportStep.SiteVisits:
                    return Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid 
                        && CurrentStep != ImportStep.Finish;
                case ImportStep.TreeMeasurements:
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

        public ImportStep SuggestedStep
        {
            get
            {
                if (Trip.IsImported)
                {
                    return ImportStep.Finish;
                }
                if (Trip.ValidateRegardingImport().IsValid)
                {
                    return ImportStep.Review;
                }
                if (Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid
                    && Trip.AllSiteVisitsHaveSubsiteVisits
                    && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid
                    && Trip.AllSubsiteVisitsOfAllSiteVisitsHaveTreeMeasurements
                    && Trip.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid)
                {
                    return ImportStep.TreeMeasurements;
                }
                if (Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid
                    && Trip.AllSiteVisitsHaveSubsiteVisits
                    && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
                {
                    return ImportStep.SiteVisits;
                }
                return ImportStep.Trip;
            }
        }

        public void SaveTrip()
        {
            using (UnitOfWork.BeginBusinessTransaction())
            {
                TripService.Save(Trip);
                UnitOfWork.Persist();
            }
        }

        public void FinishImport()
        {
            using (UnitOfWork.BeginBusinessTransaction())
            {
                TripService.Import(Trip);
                UnitOfWork.Persist();
            }
        }

        private Trip m_Trip;
        public Trip Trip
        {
            get
            {
                if (m_Trip == null || m_Trip.Id != ApplicationSession.ImportSelectedTripId)
                {
                    m_Trip = TripService.FindById(ApplicationSession.ImportSelectedTripId);
                    if (m_Trip == null)
                    {
                        Trip lastSavedTrip = TripService.FindLastSavedTripByUserId(UserSession.CurrentUser.Id);
                        if (lastSavedTrip != null && !lastSavedTrip.IsImported)
                        {
                            ApplicationSession.ImportSelectedTripId = lastSavedTrip.Id;
                            m_Trip = lastSavedTrip;
                        }
                        else
                        {
                            ApplicationSession.ImportSelectedTripId = 0;
                            m_Trip = Trip.Create();
                            m_Trip.AddMeasurer();
                        }
                    }                
                }
                return m_Trip;
            }
        }

        public TreeMeasurementBase SelectedTreeMeasurement
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

        public TrunkMeasurement SelectedTrunkMeasurement
        {
            get { return ApplicationSession.ImportSelectedTrunkMeasurementIndex > -1 && SelectedTreeMeasurement is MultiTrunkTreeMeasurement ? ((MultiTrunkTreeMeasurement)SelectedTreeMeasurement).TrunkMeasurements[ApplicationSession.ImportSelectedTrunkMeasurementIndex] : null; }
            set { ApplicationSession.ImportSelectedTrunkMeasurementIndex = value == null ? -1 : ((MultiTrunkTreeMeasurement)SelectedTreeMeasurement).TrunkMeasurements.IndexOf(value); }
        }
    }

    public class ImportsModel
    {
        private IList<Trip> m_UserTripsNotYetImported;
        public IList<Trip> UserTripsNotYetImported
        {
            get
            {
                if (m_UserTripsNotYetImported == null)
                {
                    m_UserTripsNotYetImported = TripService.FindNotYetImportedTripsByUserId(UserSession.CurrentUser.Id);
                }
                return m_UserTripsNotYetImported;
            }
        }

        private IList<Trip> m_UserTripsAlreadyImported;
        public IList<Trip> UserTripsAlreadyImported
        {
            get
            {
                if (m_UserTripsAlreadyImported == null)
                {
                    m_UserTripsAlreadyImported = TripService.FindAlreadyImportedTripsByUserId(UserSession.CurrentUser.Id);
                }
                return m_UserTripsAlreadyImported;
            }
        }

        private Trip m_LastSavedTripNotYetImported;
        public Trip LastSavedTripNotYetImported
        {
            get
            {
                if (m_UserTripsNotYetImported == null)
                {
                    m_LastSavedTripNotYetImported = TripService.FindLastSavedTripByUserId(UserSession.CurrentUser.Id);
                }
                if (m_LastSavedTripNotYetImported == null || m_LastSavedTripNotYetImported.IsImported)
                {
                    return null;
                }
                return m_LastSavedTripNotYetImported;
            }
        }

        public Trip CreateNewTrip()
        {
            Trip trip = Trip.Create();
            trip.AddMeasurer();
            using (UnitOfWork.BeginBusinessTransaction())
            {
                TripService.Save(trip);
                UnitOfWork.Persist();
            }
            return trip;
        }

        private Trip m_SelectedTrip;
        public Trip SelectedTrip
        {
            get
            {
                if (m_SelectedTrip == null || m_SelectedTrip.Id != ApplicationSession.ImportSelectedTripId)
                {
                    m_SelectedTrip = TripService.FindById(ApplicationSession.ImportSelectedTripId);
                }
                return m_SelectedTrip;
            }
            set
            {
                ApplicationSession.ImportSelectedTripId = value.Id;
                m_SelectedTrip = value;
            }
        }

        public void RemoveSelectedTrip()
        {
            using (UnitOfWork.BeginBusinessTransaction())
            {
                TripService.Remove(SelectedTrip);
                UnitOfWork.Persist();
            }
        }
    }
}