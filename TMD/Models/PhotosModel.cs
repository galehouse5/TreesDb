using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model.Photos;

namespace TMD.Models
{
    public class ImportTreePhotoGalleryAdderModel : PhotoGalleryAdderModel
    {
        public int TripId { get; set; }
        public int TreeId { get; set; }
        public override string ActionName { get { return "AddToImportTree"; } }
        public override object RouteValues { get { return new { controller = "Photos", id = TripId, treeId = TreeId }; } }
    }

    public class ImportSubsitePhotoGalleryAdderModel : PhotoGalleryAdderModel
    {
        public int TripId { get; set; }
        public int SubsiteId { get; set; }
        public override string ActionName { get { return "AddToImportSubsite"; } }
        public override object RouteValues { get { return new { controller = "Photos", id = TripId, subsiteId = SubsiteId }; } }
    }

    public abstract class PhotoGalleryAdderModel
    {
        public abstract string ActionName { get; }
        public abstract object RouteValues { get; }
    }

    public class PhotoGalleryModel
    {
        public PhotoGalleryAdderModel Adder { get; set; }
        public bool HasAdder { get { return Adder != null; } }
        public IList<PhotoModel> Photos { get; set; }
        public bool HasPhotos { get { return Photos != null && Photos.Count() > 0; } }

        public void RemoveLastPhoto()
        {
            Photos.RemoveAt(Photos.Count - 1);
        }
    }

    public class PhotoModel
    {
        public PhotoModel()
        {
            Size = EPhotoSize.SquareThumbnail;
        }

        public int Id { get; set; }
        public int PhotoId { get; set; }
        public EPhotoSize Size { get; set; }
    }
}