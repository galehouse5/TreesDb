using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model.Users;

namespace TMD
{
    public class ModelBase
    {
        public bool IsHome { get; set; }
        public bool IsImporting { get; set; }
        public bool CanImport { get; set; }
        public bool IsBrowsing { get; set; }
        public bool IsMapping { get; set; }
        public bool IsExporting { get; set; }
        public bool CanExport { get; set; }
        public bool RequiresJavascript { get; set; }

        public ModelBase InitializeFor(User u)
        {
            if (u != null)
            {
                CanImport = u.IsInRole(UserRole.Import);
                CanExport = u.IsInRole(UserRole.Export);
            }
            return this;
        }
    }
}