using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model;

namespace TMD.Extensions
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property | AttributeTargets.Interface, AllowMultiple = true)]
    public sealed class EmphasizeAttribute : Attribute, IMetadataAware
    {
        public const string Key = "isEmphasized";

        private bool m_IsEmphasized;
        public EmphasizeAttribute(bool isEmphasized)
        {
            m_IsEmphasized = isEmphasized;
        }

        public EmphasizeAttribute()
            : this(true)
        { }

        public void OnMetadataCreated(ModelMetadata metadata)
        {
            metadata.AdditionalValues[Key] = m_IsEmphasized;
        }
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property | AttributeTargets.Interface, AllowMultiple = true)]
    public sealed class ClassificationAttribute : Attribute, IMetadataAware
    {
        public const string Key = "classification";

        private string m_Classification;
        public ClassificationAttribute(string classification)
        {
            m_Classification = classification;
        }

        public void OnMetadataCreated(ModelMetadata metadata)
        {
            metadata.AdditionalValues[Key] = m_Classification;
        }
    }

    public static partial class ModelMetadataExtensions
    {
        public static bool? IsEmphasized(this ModelMetadata metadata)
        {
            if (!metadata.AdditionalValues.ContainsKey(EmphasizeAttribute.Key))
            {
                return null;
            }
            return (bool)metadata.AdditionalValues[EmphasizeAttribute.Key];
        }

        public static string Classification(this ModelMetadata metadata)
        {
            if (!metadata.AdditionalValues.ContainsKey(ClassificationAttribute.Key))
            {
                return null;
            }
            return (string)metadata.AdditionalValues[ClassificationAttribute.Key];
        }

        public static bool IsModelNull(this ModelMetadata metadata)
        {
            if (metadata.Model == null)
            {
                return true;
            }
            if (metadata.Model is string && string.IsNullOrEmpty((string)metadata.Model))
            {
                return true;
            }
            if (metadata.Model is ISpecified && !((ISpecified)metadata.Model).IsSpecified)
            {
                return true;
            }
            if (metadata.Model is Enum && "NotSpecified".Equals(metadata.Model.ToString()))
            {
                return true;
            }
            return false;
        }
    }
}