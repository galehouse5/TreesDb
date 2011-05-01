using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model.Photos;
using TMD.Model;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Locations;

namespace TMD.Models
{
    public abstract class PhotoGalleryModel
    {
        public int Count { get { return Photos.Count; } }
        public IList<IPhoto> Photos { get; set; }
        public abstract string AddPhotoActionName { get; }
        public abstract object AddPhotoRouteValues { get; }
    }

    public class ImportTreePhotoGalleryModel : PhotoGalleryModel
    {
        public int TripId { get; set; }
        public int TreeId { get; set; }
        public override string AddPhotoActionName { get { return "AddToImportTree"; } }
        public override object AddPhotoRouteValues { get { return new { controller = "Photos", id = TripId, treeId = TreeId }; } }
    }

    public class ImportSubsitePhotoGalleryModel : PhotoGalleryModel
    {
        public int TripId { get; set; }
        public int SubsiteId { get; set; }
        public override string AddPhotoActionName { get { return "AddToImportSubsite"; } }
        public override object AddPhotoRouteValues { get { return new { controller = "Photos", id = TripId, subsiteId = SubsiteId }; } }
    }

    public abstract class PhotoCaptionModel
    {
        public string Caption { get; set; }
        [UIHint("ConcatenatedNames")]
        public IList<Name> Photographers { get; set; }
        public abstract string ContextFormat { get; }
        public abstract IList<string> ContextArguments { get; }
        public abstract IList<string> ContextArgumentActionNames { get; }
        public abstract IList<object> ContextArgumentRouteValues { get; }
    }

    public class TreePhotoCaptionModel : PhotoCaptionModel
    {
        public int TreeId { get; set; }
        public string BotanicalName { get; set; }
        public int SiteId { get; set; }
        public string SiteName { get; set; }
        public State State { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }

        public override string ContextFormat
        {
            get { return "{0} of {1} in {2}"; }
        }

        public override IList<string> ContextArguments
        {
            get { return new List<string> { BotanicalName, SiteName, StateName }; }
        }

        public override IList<string> ContextArgumentActionNames
        {
            get { return new List<string> { "TreeDetails", "SiteDetails", "StateDetails" }; }
        }

        public override IList<object> ContextArgumentRouteValues
        {
            get { return new List<object> { new { id = TreeId, controller = "Browse" }, new { id = SiteId, controller = "Browse" }, new { id = StateId, controller = "Browse" } }; }
        }
    }

    public class SubsitePhotoCaptionModel : PhotoCaptionModel
    {
        public int SiteId { get; set; }
        public string SiteName { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }

        public override string ContextFormat
        {
            get { return "{0} in {1}"; }
        }

        public override IList<string> ContextArguments
        {
            get { return new List<string> { SiteName, StateName }; }
        }

        public override IList<string> ContextArgumentActionNames
        {
            get { return new List<string> { "SiteDetails", "StateDetails" }; }
        }

        public override IList<object> ContextArgumentRouteValues
        {
            get { return new List<object> { new { id = SiteId, controller = "Browse" }, new { id = StateId, controller = "Browse" } }; }
        }
    }

    public class EmptyContextPhotoCaptionModel : PhotoCaptionModel
    {
        public override string ContextFormat
        {
            get { return string.Empty; }
        }

        public override IList<string> ContextArguments
        {
            get { return new List<string>(); }
        }

        public override IList<string> ContextArgumentActionNames
        {
            get { return new List<string>(); }
        }

        public override IList<object> ContextArgumentRouteValues
        {
            get { return new List<object>(); }
        }
    }
}