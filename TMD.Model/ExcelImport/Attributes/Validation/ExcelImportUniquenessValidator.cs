using System.Collections.Generic;
using System.Linq;

namespace TMD.Model.ExcelImport.Attributes.Validation
{
    public class ExcelImportUniquenessValidator : ExcelImportAttributeValidator
    {
        public ExcelImportUniquenessValidator(ExcelImportAttribute innerAttribute)
            : base(innerAttribute)
        { }

        protected IEnumerable<ExcelImportEntity> GetPrecedingEntities(ExcelImportEntity entity, IEnumerable<ExcelImportEntity> context)
        {
            return context.Where(e => e.EntityType.Equals(entity.EntityType))
                .OrderBy(e => e.RowIndex).TakeWhile(e => !e.Equals(entity));
        }

        protected override IEnumerable<string> GetErrors(ExcelImportEntity entity, object value, IEnumerable<ExcelImportEntity> context)
        {
            if (GetPrecedingEntities(entity, context).Any(e => value.Equals(e[this])))
                yield return string.Format("{0} cannot be repeated.", Name);
        }
    }
}
