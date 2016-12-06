using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace TMD.ActionResults
{
    public class CsvFileResult : FileContentResult
    {
        protected static string CsvEncode(string value)
        {
            // Wrapping the value in double quotes ensures that a comma in the value
            // will not cause the string to delimit prematurely. We must then escape
            // double quote characters with `""`.
            return $"\"{(value ?? string.Empty).Replace("\"", "\"\"")}\"";
        }

        protected static string GetCsv(IEnumerable<IEnumerable<string>> rows)
            => string.Join(Environment.NewLine,
                rows.Select(row => string.Join(",", row.Select(CsvEncode))));

        public CsvFileResult(IEnumerable<IEnumerable<string>> rows, string fileDownloadName)
            : base(Encoding.UTF8.GetBytes(GetCsv(rows)), "text/csv")
        {
            FileDownloadName = fileDownloadName;
        }
    }
}