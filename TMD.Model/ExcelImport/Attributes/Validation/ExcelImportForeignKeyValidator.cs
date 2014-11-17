using System.Collections.Generic;
using System.Linq;

namespace TMD.Model.ExcelImport.Attributes.Validation
{
    public class ExcelImportForeignKeyValidator : ExcelImportAttributeValidator
    {
        public ExcelImportForeignKeyValidator(ExcelImportAttribute innerAttribute, ExcelImportEntityType parentEntityType, ExcelImportAttribute parentAttribute)
            : base(innerAttribute)
        {
            this.ParentEntityType = parentEntityType;
            this.ParentAttribute = parentAttribute;
        }

        public ExcelImportEntityType ParentEntityType { get; private set; }
        public ExcelImportAttribute ParentAttribute { get; private set; }

        protected override IEnumerable<string> GetErrors(ExcelImportEntity entity, object value, IEnumerable<ExcelImportEntity> context)
        {
            if (!context.Any(e => ParentEntityType.Equals(e.EntityType) && value.Equals(e[ParentAttribute])))
                yield return string.Format("{0} must exist in the {1} worksheet.", Name, ParentEntityType.Worksheet);
        }
    }
}
