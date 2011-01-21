using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using TMD.Model.Trees;
using System.ComponentModel;
using TMD.Model.Sites;
using TMD.Model.Photos;

namespace TMD.Models
{
    public class BrowseMenuWidgetModel
    {
        public bool IsSelected { get; set; }
    }

    public class DatedPhotosModel
    {
        public DateTime Date { get; set; }
        public IList<IPhoto> Photos { get; set; }
        public IList<Name> Photographers { get; set; }
    }

    public class TreeDetailsModel
    {
        public Site Site { get; set; }
        public Subsite Subsite { get; set; }
        public Tree Tree { get; set; }
        public IList<Measurement> Measurements { get; set; }
        public IList<DatedPhotosModel> DatedPhotos { get; set; }
    }
}