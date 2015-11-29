using System;
using System.Web;

namespace TMD.Extensions
{
    public static class HttpContextExtensions
    {
        private static string newRequestID()
        {
            string guid = Guid.NewGuid().ToString("N");

            // readability is more important than global uniqueness
            return string.Concat(guid.Substring(0, 3),
                '-', guid.Substring(3, 3),
                '-', guid.Substring(6, 3))
                .ToUpper();
        }

        // used to correlate a request to an error log entry
        public static string RequestID(this HttpContextBase context)
        {
            if (!context.Items.Contains("RequestID"))
            {
                context.Items["RequestID"] = newRequestID();
            }

            return (string)context.Items["RequestID"];
        }
    }
}
