namespace TMD.Model.Excel
{
    public interface IExcelComment
    {
        int Row { get; }
        int Column { get; }
        string Author { get; set; }
        string Note { get; set; }
    }
}
