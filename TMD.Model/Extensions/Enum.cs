using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.ComponentModel;

namespace TMD.Model.Extensions
{
    public static class EnumExtensions
    {
        public static string Describe(this Enum value)
        {
            FieldInfo fi = value.GetType().GetField(value.ToString());
            DescriptionAttribute[] attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);
            return (attributes.Length > 0) ? attributes[0].Description : value.ToString();
        }

        public static T ParseEnum<T>(this string source, T defaultValue) where T : struct, IComparable, IFormattable, IConvertible
        {
            if (string.IsNullOrEmpty(source))
            {
                return defaultValue;
            }
            int i;
            if (int.TryParse(source, out i))
            {
                source = '_' + i.ToString();
            }
            return (T)Enum.Parse(typeof(T), source, true);
        }
    }
}
