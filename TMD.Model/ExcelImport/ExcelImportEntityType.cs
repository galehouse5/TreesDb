using System.Collections.Generic;
using System.Linq;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.EntityTypes;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public abstract class ExcelImportEntityType
    {
        public static readonly ExcelImportEntityType Site = new ExcelImportSiteType(1);
        public static readonly ExcelImportEntityType Subsite = new ExcelImportSubsiteType(2);
        public static readonly ExcelImportEntityType Tree = new ExcelImportTreeType(3);
        public static readonly ExcelImportEntityType Trunk = new ExcelImportTrunkType(4);
        public static readonly ExcelImportEntityType Photo = new ExcelImportPhotoType(5);

        public static readonly ExcelImportEntityType[] All = new ExcelImportEntityType[] { Site, Subsite, Tree, Trunk, Photo };

        protected ExcelImportEntityType(byte id)
        {
            this.ID = id;
        }

        public int ID { get; private set; }
        public abstract string Name { get; }
        public abstract string Worksheet { get; }
        public abstract int StartRow { get; }

        public abstract IEnumerable<ExcelImportAttribute> Attributes { get; }

        public abstract ExcelImportEntity CreateEntity(IExcelWorksheet worksheet, int row, User user);

        public IEnumerable<ExcelImportEntity> CreateEntities(IExcelWorkbook workbook, User user)
        {
            IExcelWorksheet worksheet = workbook.Worksheet(Worksheet);

            int lastNonEmptyIndex = 0;
            for (int i = 0; i < lastNonEmptyIndex + 100; i++)
            {
                ExcelImportEntity entity = CreateEntity(worksheet, StartRow + i, user);

                if (!entity.IsEmpty)
                {
                    lastNonEmptyIndex = i;
                    yield return entity;
                }
            }
        }

        public void ShowErrors(IEnumerable<KeyValuePair<ExcelImportValue, string>> errors, IExcelWorkbook workbook)
        {
            IExcelWorksheet worksheet = workbook.Worksheet(Worksheet);
            worksheet.SetTabStyle(ExcelStyle.Error);
            worksheet.SetActive();

            foreach (var entityErrors in errors.GroupBy(e => e.Key.Entity))
            {
                entityErrors.Key.ShowErrors(entityErrors, worksheet);
            }
        }

        public void HideErrors(IEnumerable<ExcelImportEntity> entities, IExcelWorkbook workbook)
        {
            IExcelWorksheet worksheet = workbook.Worksheet(Worksheet);
            worksheet.SetTabStyle(ExcelStyle.Normal);

            int lastNonEmptyIndex = entities.Max(e => e.RowIndex);
            for (int i = 0; i < lastNonEmptyIndex + 100; i++)
            {
                foreach (ExcelImportAttribute attribute in Attributes)
                {
                    IExcelCell cell = worksheet.Cell(StartRow + i, attribute.Column);
                    if (cell.HasStyle(ExcelStyle.Warning) || cell.HasStyle(ExcelStyle.Error))
                    {
                        cell.SetStyle(ExcelStyle.Normal);
                    }

                    IExcelComment comment = worksheet.Comment(StartRow + i, attribute.Column);
                    if (comment != null && "TMD".Equals(comment.Author))
                    {
                        worksheet.Remove(comment);
                    }
                }
            }
        }

        public void Fill(IEnumerable<ExcelImportEntity> entities, IExcelWorkbook workbook)
        {
            foreach (ExcelImportEntity entity in entities)
            {
                IExcelWorksheet worksheet = workbook.Worksheet(Worksheet);

                entity.Fill(worksheet);
            }
        }

        protected IEnumerable<ExcelImportValue> CreateValues(ExcelImportEntity entity, IExcelWorksheet worksheet)
        {
            return Attributes.Select(a => a.CreateValue(entity, worksheet)).Where(v => v.Attribute.IsRequired || !v.IsEmpty).ToArray();
        }

        public override string ToString()
        {
            return string.Format("{0}!{1}", Worksheet, StartRow);
        }
    }
}
