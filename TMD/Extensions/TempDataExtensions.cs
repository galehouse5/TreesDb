using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc.Html;
using System.Web.Mvc;

namespace TMD.Extensions
{
    public static class TempDataExtensions
    {
        public static partial class Keys
        {
            public const string AccountMessage = "accountMessage";
        }

        public static string GetAccountMessage(this TempDataDictionary tempData)
        {
            return tempData[Keys.AccountMessage] as string;
        }

        public static void SetAccountMessage(this TempDataDictionary tempData, string accountMessage)
        {
            tempData[Keys.AccountMessage] = accountMessage;
        }
    }
}