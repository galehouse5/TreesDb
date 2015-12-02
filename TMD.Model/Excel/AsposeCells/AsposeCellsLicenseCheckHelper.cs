using Aspose.Cells;
using System;
using System.Collections;
using System.Linq;
using System.Reflection;

namespace TMD.Model.Excel.AsposeCells
{
    public class AsposeCellsLicenseCheckHelper
    {
        public static readonly AsposeCellsLicenseCheckHelper Instance = new AsposeCellsLicenseCheckHelper();

        private AsposeCellsLicenseCheckHelper()
        { }

        protected bool IsLicenseManagerType(Type type)
        {
            // internal class Class1654
            if (!type.IsClass)
                return false;

            var staticFields = type.GetFields(BindingFlags.NonPublic | BindingFlags.Static);
            // private static Class1654 class1654_0
            return staticFields.Any(f => f.FieldType.Equals(type))
            // private static Hashtable hashtable_0
                && staticFields.Any(f => f.FieldType.Equals(typeof(Hashtable)));
        }

        // private DateTime dateTime_1
        protected FieldInfo GetLicenseExpirationField(Type licenseManagerType)
            => licenseManagerType
            .GetFields(BindingFlags.NonPublic | BindingFlags.Instance)
            .Where(f => f.FieldType.Equals(typeof(DateTime)))
            .Skip(1).Single();

        // private Enum175 enum175_0
        protected FieldInfo GetLicenseStateField(Type licenseManagerType)
            => licenseManagerType
            .GetFields(BindingFlags.NonPublic | BindingFlags.Instance)
            .Where(f => f.FieldType.IsEnum)
            .Skip(1).Single();

        // Enum175.const_1
        protected Enum GetValidLicenseState(Type licenseStateEnumType)
            => licenseStateEnumType
            .GetEnumValues().Cast<Enum>()
            .Skip(1).Single();

        // private static Class1654 class1654_0
        protected FieldInfo GetStaticLicenseManagerField(Type licenseManagerType)
            => licenseManagerType
            .GetFields(BindingFlags.NonPublic | BindingFlags.Static)
            .Single(f => f.FieldType.Equals(licenseManagerType));

        // modifies internal state of Aspose license manager to disable license check
        // the necessary modifications were discovered using a deobfuscator (de4dot) and decompiler (dotPeek)
        public void DisableLicenseCheck()
        {
            Type licenseManagerType = Assembly.GetAssembly(typeof(License))
                .GetTypes().Single(IsLicenseManagerType);

            object licenseManagerInstance = Activator.CreateInstance(licenseManagerType);
            GetLicenseExpirationField(licenseManagerType)
                .SetValue(licenseManagerInstance, DateTime.MaxValue);
            FieldInfo licenseStateField = GetLicenseStateField(licenseManagerType);
            Enum validLicenseState = GetValidLicenseState(licenseStateField.FieldType);
            licenseStateField.SetValue(licenseManagerInstance, validLicenseState);

            GetStaticLicenseManagerField(licenseManagerType)
                .SetValue(null, licenseManagerInstance);
        }

        public bool HasLicenseExpired(Exception exception)
            => exception is InvalidOperationException
            && exception.Message.Equals("The license has expired.");
    }
}
