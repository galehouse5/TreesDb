using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Trips;
using System.Web.Mvc;
using TMD.Model.Trees;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.Models
{
    public class ImportTripsModel
    {
        public IList<Trip> PendingTrips { get; set; }
        public IList<Trip> ImportedTrips { get; set; }
    }

    public class ImportMenuWidgetModel
    {
        public bool IsSelected { get; set; }
        public bool CanImport { get; set; }
        public Trip LatestTrip { get; set; }
    }

    //public enum ImportStep
    //{
    //    Start = 1,
    //    Trip = 2,
    //    SiteVisits = 3,
    //    TreeMeasurements = 4,
    //    Review = 5,
    //    Finish = 6
    //}

    //public class ImportStepModel
    //{
    //    public Trip Trip { get; set; }
    //    public ImportStep CurrentStep { get; set; }

    //    public bool IsCurrentStepPremature
    //    {
    //        get { return !CanAdvanceToStep(CurrentStep); }
    //    }

    //    public bool IsStepAnAdvance(ImportStep step)
    //    {
    //        return (int)step > (int)CurrentStep;
    //    }

    //    public bool CanAdvanceToStep(ImportStep step)
    //    {
    //        if (Trip == null && step != ImportStep.Start)
    //        {
    //            return false;
    //        }
    //        switch (step)
    //        {
    //            case ImportStep.Start:
    //            case ImportStep.Trip:
    //                return CurrentStep != ImportStep.Finish;
    //            case ImportStep.SiteVisits:
    //                return Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid 
    //                    && CurrentStep != ImportStep.Finish;
    //            case ImportStep.TreeMeasurements:
    //                return CurrentStep != ImportStep.Finish
    //                    && Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid 
    //                    && Trip.AllSiteVisitsHaveSubsiteVisits
    //                    && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid;
    //            case ImportStep.Review:
    //                return CurrentStep != ImportStep.Finish
    //                    && Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid
    //                    && Trip.AllSiteVisitsHaveSubsiteVisits
    //                    && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid
    //                    && Trip.AllSubsiteVisitsOfAllSiteVisitsHaveTreeMeasurements
    //                    && Trip.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid;
    //            case ImportStep.Finish:
    //                return Trip.ValidateRegardingImport().IsValid;
    //            default:
    //                return false;
    //        }
    //    }

    //    public ImportStep SuggestedStep
    //    {
    //        get
    //        {
    //            if (Trip.IsImported)
    //            {
    //                return ImportStep.Finish;
    //            }
    //            if (Trip.ValidateRegardingImport().IsValid)
    //            {
    //                return ImportStep.Review;
    //            }
    //            if (Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid
    //                && Trip.AllSiteVisitsHaveSubsiteVisits
    //                && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid
    //                && Trip.AllSubsiteVisitsOfAllSiteVisitsHaveTreeMeasurements
    //                && Trip.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid)
    //            {
    //                return ImportStep.TreeMeasurements;
    //            }
    //            if (Trip.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid
    //                && Trip.AllSiteVisitsHaveSubsiteVisits
    //                && Trip.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid)
    //            {
    //                return ImportStep.SiteVisits;
    //            }
    //            return ImportStep.Trip;
    //        }
    //    }
    //}
}