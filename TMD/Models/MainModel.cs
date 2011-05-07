using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model.Photos;

namespace TMD.Models
{
    public class MainMenuWidgetModel
    {
        public bool IsSelected { get; set; }
    }

    public class MainModel
    {
        public IEnumerable<IPhoto> RecentPhotos { get; set; }
    }
}