using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Users
{
    [Flags]
    public enum EUserRoles
    {
        None = 0x0,
        Administrator = 0x1,
        Importer = 0x2,
        Exporter = 0x4,
    }
}
