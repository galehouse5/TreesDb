using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Reflection;

namespace TMD
{
    public static partial class ViewDataKeys
    {
        public const string JavascriptRequired = "javascriptRequired";
    }

    public class ViewData : ViewDataDictionary
    {
        private ViewDataDictionary m_ViewData;

        public ViewData(ViewDataDictionary viewData)
        {
            m_ViewData = viewData;
        }

        #region Overrides

        public override bool Equals(object obj)
        {
            return m_ViewData.Equals(obj);
        }

        public override int GetHashCode()
        {
            return m_ViewData.GetHashCode();
        }

        public override ModelMetadata ModelMetadata
        {
            get
            {
                return m_ViewData.ModelMetadata;
            }
            set
            {
                m_ViewData.ModelMetadata = value;
            }
        }

        public override string ToString()
        {
            return m_ViewData.ToString();
        }

        #endregion

        public bool JavascriptRequired
        {
            get { return (bool)(m_ViewData[ViewDataKeys.JavascriptRequired] ?? true); }
            set { m_ViewData[ViewDataKeys.JavascriptRequired] = value; }
        }
    }
}