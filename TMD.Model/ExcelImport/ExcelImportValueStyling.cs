using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using System.Globalization;

namespace TMD.Model.ExcelImport
{
    public class ExcelImportValueStyling
    {
        private ExcelImportValueStyling()
        { }

        public Color FontColor { get; private set; }
        public ExcelFillStyle FillPatternType { get; private set; }
        public Color FillBackgroundColor { get; private set; }
        public Color FillPatternColor { get; private set; }

        public void SetStyle(ExcelRange range)
        {
            range.Style.Font.Color.SetColor(FontColor);
            range.Style.Fill.PatternType = FillPatternType;
            range.Style.Fill.BackgroundColor.SetColor(FillBackgroundColor);
            range.Style.Fill.PatternColor.SetColor(FillPatternColor);
        }

        private bool areEqual(Color colorA, ExcelColor colorB)
        {
            if (null == colorB.Rgb) return Color.Empty == colorA;

            return Color.FromArgb(int.Parse(colorB.Rgb, NumberStyles.HexNumber)) == colorA;
        }

        public bool HasStyle(ExcelRange range)
        {
            return areEqual(FontColor, range.Style.Font.Color)
                && FillPatternType == range.Style.Fill.PatternType
                && areEqual(FillBackgroundColor, range.Style.Fill.BackgroundColor)
                && areEqual(FillPatternColor, range.Style.Fill.PatternColor);
        }

        public static readonly ExcelImportValueStyling Invalid = new ExcelImportValueStyling
        {
            FontColor = Color.FromArgb(156, 0, 6),
            FillPatternType = ExcelFillStyle.Solid,
            FillBackgroundColor = Color.FromArgb(255, 199, 206),
            FillPatternColor = Color.FromArgb(0, 255, 255, 255)
        };

        public static readonly ExcelImportValueStyling Attention = new ExcelImportValueStyling
        {
            FontColor = Color.FromArgb(156, 101, 0),
            FillPatternType = ExcelFillStyle.Solid,
            FillBackgroundColor = Color.FromArgb(255, 235, 156),
            FillPatternColor = Color.FromArgb(0, 255, 255, 255)
        };
    }
}
