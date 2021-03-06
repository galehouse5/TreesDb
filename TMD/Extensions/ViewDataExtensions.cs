﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TMD.Extensions
{
    public static class ViewDataExtensions
    {
        public static partial class Keys
        {
            public const string JavascriptRequired = "javascriptRequired";
            public const string RenderFooter = "renderFooter";
        }

        public static bool GetJavascriptRequired(this ViewDataDictionary viewData)
        {
            return (bool)(viewData[Keys.JavascriptRequired] ?? false);
        }

        public static void SetJavascriptRequired(this ViewDataDictionary viewData, bool javascriptRequired)
        {
            viewData[Keys.JavascriptRequired] = javascriptRequired;
        }

        public static bool GetRenderFooter(this ViewDataDictionary viewData)
        {
            return (bool)(viewData[Keys.RenderFooter] ?? true);
        }

        public static void SetRenderFooter(this ViewDataDictionary viewData, bool renderFooter)
        {
            viewData[Keys.RenderFooter] = renderFooter;
        }
    }
}