using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TMD
{
    public class ViewPageBase : ViewPage
    {
        private TempData m_TempData;
        public new TempData TempData
        {
            get
            {
                if (m_TempData == null)
                {
                    m_TempData = new TempData(base.TempData);
                }
                return m_TempData;
            }
        }

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

    public class ViewPageBase<TModel> : ViewPage<TModel>
    {
        private TempData m_TempData;
        public new TempData TempData
        {
            get
            {
                if (m_TempData == null)
                {
                    m_TempData = new TempData(base.TempData);
                }
                return m_TempData;
            }
        }

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

    public class ViewMasterPageBase<TModel> : ViewMasterPage<TModel>
    {
        private TempData m_TempData;
        public new TempData TempData
        {
            get
            {
                if (m_TempData == null)
                {
                    m_TempData = new TempData(base.TempData);
                }
                return m_TempData;
            }
        }

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

    public class ViewMasterPageBase : ViewMasterPage
    {
        private TempData m_TempData;
        public new TempData TempData
        {
            get 
            {
                if (m_TempData == null)
                {
                    m_TempData = new TempData(base.TempData);
                }
                return m_TempData; 
            }
        }

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