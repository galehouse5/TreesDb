using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace TMD.Model.ExcelImport.Attributes.Validation
{
    public class ExcelImportFileExtensionValidator : ExcelImportAttributeValidator
    {
        private string[] extensions;

        public ExcelImportFileExtensionValidator(ExcelImportAttribute innerAttribute, params string[] extensions)
            : base(innerAttribute)
        {
            this.extensions = extensions;
        }

        protected override IEnumerable<string> GetErrors(ExcelImportEntity entity, object value, IEnumerable<ExcelImportEntity> context)
        {
            string name = value.ToString();
            FileInfo info = new FileInfo(name);
            string extension = info.Extension.TrimStart('.');

            if (!extensions.Contains(extension))
                yield return string.Format("{0} must have a valid extension.", Name);
        }
    }
}
