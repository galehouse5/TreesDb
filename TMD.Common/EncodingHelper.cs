using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common
{
    public static class EncodingHelper
    {
        public static string GuidToBase64(Guid guid)
        {
            return Convert.ToBase64String(guid.ToByteArray())
                .Replace("/", "-")
                .Replace("+", "_")
                .Replace("=", "");
        }

        public static Guid Base64ToGuid(string base64)
        {
            base64 = base64
                .Replace("-", "/")
                .Replace("_", "+")
                + "==";
            try
            {
                return new Guid(Convert.FromBase64String(base64));
            }
            catch (FormatException ex)
            {
                throw new FormatException("Improperly formed Base64 string.", ex);
            }
        }
    }
}
