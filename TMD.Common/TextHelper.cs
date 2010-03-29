using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Globalization;
using System.Reflection;

namespace TMD.Common
{
    public static class TextHelper
    {
        public static string ToTitleCase(this string str)
        {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(str);
        }

        public static string ToSummary<T>(this IList<T> list, string format, params string[] properties)
        {
            Type type = typeof(T);
            PropertyInfo[] props = new PropertyInfo[properties.Length];
            for (int i = 0; i < properties.Length; i++)
            {
                props[i] = type.GetProperty(properties[i]);
            }
            List<string> sortedValues = new List<string>();
            string[] values = new string[properties.Length];
            foreach (T item in list)
            {
                for (int i = 0; i < props.Length; i++)
                {
                    values[i] = props[i].GetValue(item, null).ToString();
                }
                sortedValues.Add(string.Format(format, values));
            }
            sortedValues.Sort();
            StringBuilder summary = new StringBuilder();
            for (int i = 0; i < sortedValues.Count; i++)
            {
                if (i > 0)
                {
                    if (i == sortedValues.Count - 1)
                    {
                        summary.Append(" and ");
                    }
                    else
                    {
                        summary.Append(", ");
                    }
                }
                summary.Append(sortedValues[i]);
            }
            return summary.ToString();
        }
    }
}
