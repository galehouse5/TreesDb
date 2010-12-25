using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model.Photos;

namespace TMD.Models
{
    public class ImportTreePhotoAdderModel : PhotoAdderModel
    {
        public int TripId { get; set; }
        public int TreeId { get; set; }

        public override string ActionName { get { return "AddToTripTree"; } }
        public override object RouteValues { get { return new { controller = "Photo", id = TripId, treeId = TreeId }; } }
    }

    public abstract class PhotoAdderModel
    {
        public abstract string ActionName { get; }
        public abstract object RouteValues { get; }
    }

    public class PhotoGalleryModel
    {
        public PhotoAdderModel Adder { get; set; }
        public bool HasAdder { get { return Adder != null; } }
        public IList<PhotoModel> Photos { get; set; }
        public bool HasPhotos { get { return Photos != null && Photos.Count() > 0; } }
    }

    public class PhotoModel
    {
        public PhotoModel()
        {
            Size = EPhotoSize.SquareThumbnail;
        }

        public int Id { get; set; }
        public EPhotoSize Size { get; set; }
    }
}