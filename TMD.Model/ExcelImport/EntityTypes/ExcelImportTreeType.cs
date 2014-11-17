using System.Collections.Generic;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.Attributes;
using TMD.Model.ExcelImport.Attributes.Validation;
using TMD.Model.ExcelImport.Entities;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport.EntityTypes
{
    public class ExcelImportTreeType : ExcelImportEntityType
    {
        public static readonly ExcelImportAttribute SubsiteName = new ExcelImportForeignKeyValidator(
            innerAttribute: new ExcelImportStringAttribute(1, "Subsite Name") { IsRequired = true },
            parentEntityType: ExcelImportEntityType.Subsite,
            parentAttribute: ExcelImportSubsiteType.SubsiteName);
        public static readonly ExcelImportAttribute TreeName = new ExcelImportUniquenessValidator(
            new ExcelImportStringAttribute(2, "Tree Name"));
        public static readonly ExcelImportAttribute CommonName = new ExcelImportStringAttribute(3, "Common Name") { IsRequired = true };
        public static readonly ExcelImportAttribute BotanicalName = new ExcelImportStringAttribute(4, "Botanical Name") { IsRequired = true };
        public static readonly ExcelImportAttribute Height = new ExcelImportFloatAttribute(5, "Height") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute HeightMeasurementMethod = new ExcelImportEnumAttribute<ExcelImportHeightMeasurementMethod>(6, "Height Measurement Method");
        public static readonly ExcelImportAttribute Girth = new ExcelImportFloatAttribute(7, "Girth") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute CrownMaxSpread = new ExcelImportFloatAttribute(8, "Crown Max Spread") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute Date = new ExcelImportDateAttribute(9, "Date") { IsRequired = true, ValueFormat = "{0:d}" };
        public static readonly ExcelImportAttribute FirstMeasurer = new ExcelImportStringAttribute(10, "First Measurer");
        public static readonly ExcelImportAttribute SecondMeasurer = new ExcelImportStringAttribute(11, "Second Measurer");
        public static readonly ExcelImportAttribute ThirdMeasurer = new ExcelImportStringAttribute(12, "Third Measurer");
        public static readonly ExcelImportAttribute FormType = new ExcelImportEnumAttribute<ExcelImportTreeFormType>(13, "Form Type");
        public static readonly ExcelImportAttribute FormComments = new ExcelImportStringAttribute(14, "Form Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute Status = new ExcelImportEnumAttribute<ExcelImportTreeStatus>(15, "Status");
        public static readonly ExcelImportAttribute HealthStatus = new ExcelImportStringAttribute(16, "Health Status");
        public static readonly ExcelImportAttribute AgeClass = new ExcelImportEnumAttribute<ExcelImportTreeAgeClass>(17, "Age Class");
        public static readonly ExcelImportAttribute Age = new ExcelImportIntegerAttribute(18, "Age") { MinInclusive = 1 };
        public static readonly ExcelImportAttribute AgeMethod = new ExcelImportEnumAttribute<ExcelImportTreeAgeMethod>(19, "Age Method");
        public static readonly ExcelImportAttribute TerrainType = new ExcelImportEnumAttribute<ExcelImportTerrainType>(20, "Terrain Type");
        public static readonly ExcelImportAttribute Latitude = new ExcelImportFloatAttribute(21, "Latitude") { ValueFormat = "{0:#.00000}", MinInclusive = -90f, MaxInclusive = 90f };
        public static readonly ExcelImportAttribute Longitude = new ExcelImportFloatAttribute(22, "Longitude") { ValueFormat = "{0:#.00000}", MinInclusive = -180f, MaxInclusive = 180f };
        public static readonly ExcelImportAttribute PublicizeCoordinates = new ExcelImportBooleanAttribute(23, "Publicize Coordinates");
        public static readonly ExcelImportAttribute Elevation = new ExcelImportIntegerAttribute(24, "Elevation") { MinInclusive = 1 };
        public static readonly ExcelImportAttribute GeneralComments = new ExcelImportStringAttribute(25, "General Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute HeightLaserBrand = new ExcelImportStringAttribute(26, "Height Laser Brand");
        public static readonly ExcelImportAttribute HeightClinometerBrand = new ExcelImportStringAttribute(27, "Height Clinometer Brand");
        public static readonly ExcelImportAttribute HeightMeasurementType = new ExcelImportEnumAttribute<ExcelImportHeightMeasurementType>(28, "Height Measurement Type");
        public static readonly ExcelImportAttribute HeightDistanceTop = new ExcelImportFloatAttribute(29, "Height Distance Top") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute HeightAngleTop = new ExcelImportFloatAttribute(30, "Height Angle Top") { MinInclusive = 0f, MaxExclusive = 90f };
        public static readonly ExcelImportAttribute HeightDistanceBottom = new ExcelImportFloatAttribute(31, "Height Distance Bottom") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute HeightAngleBottom = new ExcelImportFloatAttribute(32, "Height Angle Bottom") { MinExclusive = -90f, MaxInclusive = 0f };
        public static readonly ExcelImportAttribute HeightVerticalOffset = new ExcelImportFloatAttribute(33, "Height Vertical Offset");
        public static readonly ExcelImportAttribute HeightComments = new ExcelImportStringAttribute(34, "Height Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute GirthMeasurementHeight = new ExcelImportFloatAttribute(35, "Girth Measurement Height");
        public static readonly ExcelImportAttribute GirthRootCollarHeight = new ExcelImportFloatAttribute(36, "Girth Root Collar Height");
        public static readonly ExcelImportAttribute GirthComments = new ExcelImportStringAttribute(37, "Girth Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute CrownAverageSpread = new ExcelImportFloatAttribute(38, "Crown Average Spread") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute CrownSpreadMeasurementMethod = new ExcelImportEnumAttribute<ExcelImportCrownSpreadMeasurementMethod>(39, "Crown Spread Measurement Method");
        public static readonly ExcelImportAttribute CrownBaseHeight = new ExcelImportFloatAttribute(40, "Crown Base Height") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute CrownArea = new ExcelImportFloatAttribute(41, "Crown Area") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute CrownAreaMeasurementMethod = new ExcelImportStringAttribute(42, "Crown Area Measurement Method");
        public static readonly ExcelImportAttribute CrownVolume = new ExcelImportFloatAttribute(43, "Crown Volume") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute CrownVolumeCalculationMethod = new ExcelImportEnumAttribute<ExcelImportCrownVolumeCalculationMethod>(44, "Crown Volume Calculation Method");
        public static readonly ExcelImportAttribute CrownComments = new ExcelImportStringAttribute(45, "Crown Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute TrunkVolume = new ExcelImportFloatAttribute(46, "Trunk Volume") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute TrunkVolumeCalculationMethod = new ExcelImportEnumAttribute<ExcelImportTrunkVolumeCalculationMethod>(47, "Trunk Volume Calculation Method");
        public static readonly ExcelImportAttribute TrunkCount = new ExcelImportIntegerAttribute(48, "Trunk Count") { MinInclusive = 1 };
        public static readonly ExcelImportAttribute TrunkComments = new ExcelImportStringAttribute(49, "Trunk Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute TerrainShapeIndex = new ExcelImportFloatAttribute(50, "Terrain Shape Index") { MinInclusive = -1f, MaxInclusive = 1f };
        public static readonly ExcelImportAttribute LandformIndex = new ExcelImportFloatAttribute(51, "Landform Index") { MinInclusive =0f, MaxInclusive = 1f };
        public static readonly ExcelImportAttribute TerrainComments = new ExcelImportStringAttribute(52, "Terrain Comments") { MaxLength = 500 };

        public ExcelImportTreeType(byte id)
            : base(id)
        { }

        public override string Name
        {
            get { return "Tree"; }
        }

        public override string Worksheet
        {
            get { return "Trees"; }
        }

        public override int StartRow
        {
            get { return 4; }
        }

        public override IEnumerable<ExcelImportAttribute> Attributes
        {
            get
            {
                yield return SubsiteName;
                yield return TreeName;
                yield return CommonName;
                yield return BotanicalName;
                yield return Height;
                yield return HeightMeasurementMethod;
                yield return Girth;
                yield return CrownMaxSpread;
                yield return Date;
                yield return FirstMeasurer;
                yield return SecondMeasurer;
                yield return ThirdMeasurer;
                yield return FormType;
                yield return FormComments;
                yield return Status;
                yield return HealthStatus;
                yield return AgeClass;
                yield return Age;
                yield return AgeMethod;
                yield return TerrainType;
                yield return Latitude;
                yield return Longitude;
                yield return PublicizeCoordinates;
                yield return Elevation;
                yield return GeneralComments;
                yield return HeightLaserBrand;
                yield return HeightClinometerBrand;
                yield return HeightMeasurementType;
                yield return HeightDistanceTop;
                yield return HeightAngleTop;
                yield return HeightDistanceBottom;
                yield return HeightAngleBottom;
                yield return HeightVerticalOffset;
                yield return HeightComments;
                yield return GirthMeasurementHeight;
                yield return GirthRootCollarHeight;
                yield return GirthComments;
                yield return CrownAverageSpread;
                yield return CrownSpreadMeasurementMethod;
                yield return CrownBaseHeight;
                yield return CrownArea;
                yield return CrownAreaMeasurementMethod;
                yield return CrownVolume;
                yield return CrownVolumeCalculationMethod;
                yield return CrownComments;
                yield return TrunkVolume;
                yield return TrunkVolumeCalculationMethod;
                yield return TrunkCount;
                yield return TrunkComments;
                yield return TerrainShapeIndex;
                yield return LandformIndex;
                yield return TerrainComments;
            }
        }

        public override ExcelImportEntity CreateEntity(IExcelWorksheet worksheet, int row, User user)
        {
            ExcelImportEntity entity = new ExcelImportTree
            {
                Row = row,
                User = user
            };
            entity.Values = CreateValues(entity, worksheet);
            return entity;
        }
    }
}
