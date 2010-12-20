using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TMD.Models
{
    public class PhotoEditModel
    {
        public int Id { get; set; }
        public bool CanView { get; set; }
        public bool CanRemove { get; set; }
    }
}