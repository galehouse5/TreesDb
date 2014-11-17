namespace TMD.Model.Excel
{
    public interface IExcelCell
    {
        int Row { get; }
        int Column { get;  }
        object Value { get; set; }

        bool HasStyle(ExcelStyle style);
        void SetStyle(ExcelStyle style);
        void SetActive();
    }
}
