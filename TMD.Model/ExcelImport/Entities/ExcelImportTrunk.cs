using TMD.Model.ExcelImport.EntityTypes;

namespace TMD.Model.ExcelImport.Entities
{
    public class ExcelImportTrunk : ExcelImportEntity
    {
        protected internal ExcelImportTrunk()
        { }

        public override ExcelImportEntityType EntityType
        {
            get { return ExcelImportEntityType.Trunk; }
        }

        public string TreeName
        {
            get { return (string)this[ExcelImportTrunkType.TreeName]; }
        }

        public override string ToString()
        {
            return string.Format("{0}: {1}", RowIndex, TreeName);
        }

        public ExcelImportAttribute ExcelimportTrunkType { get; set; }
    }
}
