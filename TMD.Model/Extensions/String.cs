using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Globalization;
using System.Reflection;

namespace TMD.Model.Extensions
{
    public static class TextExtensions
    {
        public static string OrEmpty(this string source)
        {
            return (source ?? string.Empty);
        }

        public static string OrEmptyAndTrim(this string source)
        {
            return source.OrEmpty().Trim();
        }

        public static string OrEmptyAndTrimToUpper(this string source)
        {
            return source.OrEmptyAndTrim().ToUpper();
        }

        public static string OrEmptyAndTrimToLower(this string source)
        {
            return source.OrEmptyAndTrim().ToLower();
        }

        public static string OrEmptyAndTrimToTitleCase(this string source)
        {
            return source.OrEmptyAndTrim().ToTitleCase();
        }

        public static string OrEmptyAndTrimToSentenceCase(this string source)
        {
            return source.OrEmptyAndTrim().ToSentenceCase();
        }

        public static string ToSentenceCase(this string source)
        {
            if (source.Length > 0)
            {
                return source.Substring(0, 1).ToUpper() + source.Substring(1, source.Length - 1).ToLower();
            }
            return source;
        }

        public static string ToTitleCase(this string source)
        {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(source);
        }
    }
}
