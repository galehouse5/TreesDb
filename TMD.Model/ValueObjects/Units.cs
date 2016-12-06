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

    public static class UnitsExtensions
    {
        public static string Abbreviation(this Units value)
            => value == Units.Yards ? "yd"
            : value == Units.Meters ? "m"
            : "ft";

        public static string SubAbbreviation(this Units value)
            => value == Units.Yards ? "in"
            : value == Units.Meters ? "cm"
            : "in";
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
