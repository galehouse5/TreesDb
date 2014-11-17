namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportNullValue : ExcelImportValue
    {
        protected ExcelImportNullValue()
        { }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute)
        {
            return new ExcelImportNullValue
            {
                Entity = entity,
                Attribute = attribute
            };
        }
    }
}
