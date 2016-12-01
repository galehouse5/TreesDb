using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Photos;

namespace TMD.Models.Browse
{
    public class BrowsePhotoSumaryModel
    {
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Date { get; set; }
        public IList<IPhoto> Photos { get; set; }
        [UIHint("ConcatenatedNames")]
        public IList<Name> Photographers { get; set; }
    }
}