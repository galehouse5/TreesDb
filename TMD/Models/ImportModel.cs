using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Trips;
using TMD.Model.Sites;
using System.Web.Mvc;

namespace TMD.Models
{
    public enum EImportStep
    {
        Start = 1,
        TripInfo = 2,
        SiteInfo = 3,
        Measurements = 4,
        Review = 5,
        Finish = 6
    }

    public class ImportTripModel : IViewModel<Trip>
    {
        [DisplayName("Name:")]
        [StringLength(100)]
        public string Name { get; set; }

        [DisplayName("Date:")]
        public string Date { get; set; }

        [DisplayName("Website:")]
        [StringLength(100)]
        public string Website { get; set; }

        [DisplayName("Photos available:")]
        public bool PhotosAvailable { get; set; }

        [DisplayName("Measurer contact*:")]
        [StringLength(200)]
        public string MeasurerContactInfo { get; set; }

        public IList<ImportSiteModel> Sites { get; set; }
        
        public EImportStep CurrentStep { get; set; }

        public bool IsStepAnAdvance(EImportStep step)
        {
            return (int)step > (int)CurrentStep;
        }

        public bool CanAdvanceToStep(EImportStep step)
        {
            switch (step)
            {
                case EImportStep.Start:
                case EImportStep.TripInfo:
                    return CurrentStep != EImportStep.Finish;
                case EImportStep.SiteInfo:
                    return Entity.IsTripInfoValid && CurrentStep != EImportStep.Finish;
                case EImportStep.Measurements:
                    return Entity.IsTripInfoValid && Entity.HasSiteVisits && Entity.AreSiteVisitsValid && CurrentStep != EImportStep.Finish;
                case EImportStep.Review:
                    return Entity.IsTripInfoValid && Entity.HasSiteVisits && Entity.AreSiteVisitsValid && Entity.AllSitesAndSubsitesHaveMeasuredTrees && CurrentStep != EImportStep.Finish;
                case EImportStep.Finish:
                    return Entity.IsValid;
                default:
                    return false;
            }
        }

        public bool IsCurrentStepPremature
        {
            get { return !CanAdvanceToStep(CurrentStep); }
        }

        #region IViewModel<Trip> Members

        public Trip Entity { get; set; }

        public void FillModelFromEntity()
        {
            Name = Entity.Name;
            Date = Entity.Date;
            Website = Entity.Website;
            PhotosAvailable = Entity.PhotosAvailable;
            MeasurerContactInfo = Entity.MeasurerContactInfo;
        }

        public void FillEntityFromModel()
        {
            Entity.Name = Name;
            Entity.Date = Date;
            Entity.Website = Website;
            Entity.PhotosAvailable = PhotosAvailable;
            Entity.MeasurerContactInfo = MeasurerContactInfo;
        }

        #endregion
    }

    public class ImportSiteModel : IViewModel<SiteVisit>
    {
        public IEnumerable<SelectListItem> ListKnownStateCodes()
        {
            SelectListItem none = new SelectListItem();
            none.Value = string.Empty;
            none.Text = string.Empty;
            none.Selected = string.IsNullOrEmpty(State);
            yield return none;
            foreach (Model.State s in Model.State.KnownStates)
            {
                SelectListItem sli = new SelectListItem();
                sli.Value = s.Code;
                sli.Text = s.Name;
                sli.Selected = State == s.Code;
                yield return sli;
            }
        }


        public Guid Id { get; set; }

        [DisplayName("Name*:")]
        [StringLength(100)]
        public string Name { get; set; }

        [DisplayName("State*:")]
        public string State { get; set; }

        [DisplayName("County*:")]
        [StringLength(100)]
        public string County { get; set; }

        [DisplayName("Longitude:")]
        public string Longitude { get; set; }

        [DisplayName("Latitude:")]
        public string Latitude { get; set; }

        [DisplayName("Ownership type*:")]
        [StringLength(100)]
        public string OwnershipType { get; set; }

        [DisplayName("Ownership contact:")]
        [StringLength(200)]
        public string OwnershipContactInfo { get; set; }

        [DisplayName("Comments:")]
        [StringLength(300)]
        public string SiteComments { get; set; }

        public IList<ImportSubsiteModel> Subsites { get; set; }

        #region IViewModel<SiteVisit> Members

        public SiteVisit Entity { get; set; }

        public void FillModelFromEntity()
        {
            Id = Entity.Id;
            Name = Entity.Site.Name;
            State = Entity.Site.State.Code;
            County = Entity.Site.County;
            Longitude = Entity.Coordinates.Longitude.IsNull ? string.Empty : Entity.Coordinates.Longitude.ToString();
            Latitude = Entity.Coordinates.Latitude.IsNull ? string.Empty : Entity.Coordinates.Latitude.ToString();
            OwnershipType = Entity.OwnershipType;
            OwnershipContactInfo = Entity.OwnershipContactInfo;
            SiteComments = Entity.SiteComments;
        }

        public void FillEntityFromModel()
        {
            Entity.Site.Name = Name;
            Entity.Site.State = Model.State.Create(State);
            Entity.Site.County = County;
            Entity.Coordinates = Model.Coordinates.Create(Model.Latitude.Create(Latitude), Model.Longitude.Create(Longitude));
            Entity.OwnershipType = OwnershipType;
            Entity.OwnershipContactInfo = OwnershipContactInfo;
            Entity.SiteComments = SiteComments;
        }

        #endregion
    }

    public class ImportSubsiteModel : IViewModel<SubsiteVisit>
    {
        public Guid Id { get; set; }

        [DisplayName("Name*:")]
        [StringLength(100)]
        public string Name { get; set; }

        [DisplayName("Longitude:")]
        public string Longitude { get; set; }

        [DisplayName("Latitude:")]
        public string Latitude { get; set; }

        public Guid SiteId { get; set; }
        public string SiteName { get; set; }

        #region IViewModel<SubsiteVisit> Members

        public SubsiteVisit Entity { get; set; }
        public SiteVisit SiteVisit { get; set; }

        public void FillModelFromEntity()
        {
            Id = Entity.Id;
            Name = Entity.Subsite.Name;
            Longitude = Entity.Coordinates.Longitude.IsNull ? string.Empty : Entity.Coordinates.Longitude.ToString();
            Latitude = Entity.Coordinates.Latitude.IsNull ? string.Empty : Entity.Coordinates.Latitude.ToString();
            if (SiteVisit != null)
            {
                SiteId = SiteVisit.Id;
                SiteName = SiteVisit.Site.Name;
            }
        }

        public void FillEntityFromModel()
        {
            Entity.Subsite.Name = Name;
            Entity.Coordinates = Model.Coordinates.Create(Model.Latitude.Create(Latitude), Model.Longitude.Create(Longitude));
        }

        #endregion
    }
}