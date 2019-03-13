using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Photos;

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

    public class ImportSitePhotoGalleryModel : PhotoGalleryModel
    {
        public int TripId { get; set; }
        public int SiteId { get; set; }
        public override string AddPhotoActionName => "AddToImportSite";
        public override object AddPhotoRouteValues => new { controller = "Photos", id = TripId, siteId = SiteId };
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

    public class SitePhotoCaptionModel : PhotoCaptionModel
    {
        public int SiteId { get; set; }
        public string SiteName { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }

        public override string ContextFormat => "{0} in {1}";
        public override IList<string> ContextArguments => new List<string> { SiteName, StateName };
        public override IList<string> ContextArgumentActionNames => new List<string> { "SiteDetails", "StateDetails" };

        public override IList<object> ContextArgumentRouteValues
            => new List<object>
            {
                new { id = SiteId, controller = "Browse" },
                new { id = StateId, controller = "Browse" }
            };
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