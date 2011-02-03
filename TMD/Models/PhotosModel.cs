using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model.Photos;

namespace TMD.Models
{
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

    public abstract class PhotoGalleryModel
    {
        public int Count { get { return Photos.Count; } }
        public IList<IPhoto> Photos { get; set; }
        public abstract string AddPhotoActionName { get; }
        public abstract object AddPhotoRouteValues { get; }
    }
}