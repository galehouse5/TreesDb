using Aspose.Cells;
using System;
using System.Drawing;

namespace TMD.Model.Excel.AsposeCells
{
    public class AsposeCellsCell : IExcelCell
    {
        private Cell cell;
        private Style cellStyle;

        public AsposeCellsCell(Cell cell)
        {
            this.cell = cell;
            this.cellStyle = cell.GetStyle();
        }

        public int Row
        {
            get { return cell.Row + 1; }
        }

        public int Column
        {
            get { return cell.Column + 1; }
        }

        public object Value
        {
            get { return cell.Value; }
            set { cell.Value = value; }
        }

        protected Pattern? GetPattern(BackgroundType backgroundType)
        {
            if (backgroundType == BackgroundType.None) return Pattern.None;
            if (backgroundType == BackgroundType.Solid) return Pattern.Solid;
            return null;
        }

        protected BackgroundType GetBackgroundType(Pattern patern)
        {
            if (patern == Pattern.None) return BackgroundType.None;
            if (patern == Pattern.Solid) return BackgroundType.Solid;
            throw new NotSupportedException();
        }

        protected bool RgbEquals(Color color1, Color color2)
        {
            return color1.R == color2.R
                && color1.G == color2.G
                && color1.B == color2.B;
        }

        public bool HasStyle(ExcelStyle style)
        {
            return RgbEquals(cellStyle.Font.Color, style.FontColor)
                && RgbEquals(cellStyle.ForegroundColor, style.ForegroundColor)
                && GetPattern(cellStyle.Pattern) == style.Pattern;
        }

        public void SetStyle(ExcelStyle style)
        {
            cellStyle.Font.Color = style.FontColor;
            cellStyle.ForegroundColor = style.ForegroundColor;
            cellStyle.Pattern = GetBackgroundType(style.Pattern);
            cell.SetStyle(cellStyle);
        }

        public void SetActive()
        {
            cell.Worksheet.ActiveCell = cell.Name;
        }
    }
}
