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
        public const string RedirectToAction = "redirectToAction";
        public const string RedirectToController = "redirectToController";
        public const string RedirectToId = "redirectToId";
        public const string WidgetOptions = "widgetOptions";
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

        public string RedirectToAction
        {
            get { return (string)(m_ViewData[ViewDataKeys.RedirectToAction] ?? "Index"); }
            set { m_ViewData[ViewDataKeys.RedirectToAction] = value; }
        }

        public string RedirectToController
        {
            get { return (string)(m_ViewData[ViewDataKeys.RedirectToController] ?? "Main"); }
            set { m_ViewData[ViewDataKeys.RedirectToController] = value; }
        }

        public int RedirectToId
        {
            get { return (int)(m_ViewData[ViewDataKeys.RedirectToId] ?? 0); }
            set { m_ViewData[ViewDataKeys.RedirectToId] = value; }
        }

        public object WidgetOptions
        {
            get { return m_ViewData[ViewDataKeys.WidgetOptions]; }
            set { m_ViewData[ViewDataKeys.WidgetOptions] = value; }
        }

        public T GetWidgetOptions<T>()
        {
            return (T)WidgetOptions;
        }
    }
}