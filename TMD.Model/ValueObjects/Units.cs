using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel;

namespace TMD.Model
{
    public enum Units
    {
        [Description("ft")]
        Default = 0,
        [Description("ft")]
        Feet = 1,
        [Description("m")]
        Meters = 2,
        [Description("yd")]
        Yards = 3
    }

    public enum UnitRenderMode
    {
        // i.e. render 5' 6'' as 5' 6''
        Default = 0,
        // i.e. render 5' 6'' as 5.5'
        PrefixOnly = 1,
        // i.e. render 5' 6'' as 66''
        SubprefixOnly = 2
    }
}
