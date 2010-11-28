using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TMD
{
    public class ViewUserControlBase : ViewUserControl
    {
        private ViewData m_ViewData;
        public new ViewData ViewData
        {
            get
            {
                if (m_ViewData == null)
                {
                    m_ViewData = new ViewData(base.ViewData);
                }
                return m_ViewData;
            }
        }
    }

    public class ViewUserControlBase<T> : ViewUserControl<T>
    {
        private ViewData m_ViewData;
        public new ViewData ViewData
        {
            get
            {
                if (m_ViewData == null)
                {
                    m_ViewData = new ViewData(base.ViewData);
                }
                return m_ViewData;
            }
        }
    }
}