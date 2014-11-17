using System.Drawing;

namespace TMD.Model.Excel
{
    public enum Pattern
    {
        None, Solid
    }

    public class ExcelStyle
    {
        private ExcelStyle()
        { }

        public Color TabColor { get; private set; }
        public Color FontColor { get; private set; }
        public Color ForegroundColor { get; private set; }
        public Pattern Pattern { get; private set; }

        public static readonly ExcelStyle Error = new ExcelStyle
        {
            TabColor = Color.FromArgb(156, 0, 6),
            FontColor = Color.FromArgb(156, 0, 6),
            ForegroundColor = Color.FromArgb(255, 199, 206),
            Pattern = Pattern.Solid
        };

        public static readonly ExcelStyle Warning = new ExcelStyle
        {
            TabColor = Color.FromArgb(156, 101, 0),
            FontColor = Color.FromArgb(156, 101, 0),
            ForegroundColor = Color.FromArgb(255, 235, 156),
            Pattern = Pattern.Solid
        };

        public static readonly ExcelStyle Normal = new ExcelStyle
        {
            TabColor = Color.Empty,
            FontColor = Color.Black,
            ForegroundColor = Color.Empty,
            Pattern = Pattern.None
        };
    }
}
