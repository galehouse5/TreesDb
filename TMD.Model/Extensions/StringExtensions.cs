using System.Globalization;

namespace TMD.Model.Extensions
{
    public static class StringExtensions
    {
        public static string OrEmpty(this string source) => source ?? string.Empty;
        public static string OrEmptyAndTrim(this string source) => source.OrEmpty().Trim();
        public static string OrEmptyAndTrimToUpper(this string source) => source.OrEmptyAndTrim().ToUpper();
        public static string OrEmptyAndTrimToLower(this string source) => source.OrEmptyAndTrim().ToLower();
        public static string OrEmptyAndTrimToTitleCase(this string source) => source.OrEmptyAndTrim().ToTitleCase();
        public static string OrEmptyAndTrimToSentenceCase(this string source) => source.OrEmptyAndTrim().ToSentenceCase();
        public static string NullIfEmpty(this string source) => string.IsNullOrEmpty(source) ? null : source;

        public static string ToSentenceCase(this string source)
        {
            if (source.Length > 0)
            {
                return source.Substring(0, 1).ToUpper() + source.Substring(1, source.Length - 1).ToLower();
            }
            return source;
        }

        public static string ToTitleCase(this string source)
            => CultureInfo.CurrentCulture.TextInfo.ToTitleCase(source);
    }
}
