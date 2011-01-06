using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TMD
{
    public static partial class TempDataKeys
    {
        public const string AccountMessage = "accountMessage";
    }

    public class TempData : TempDataDictionary
    {
        private TempDataDictionary m_TempData;

        public TempData(TempDataDictionary tempData)
        {
            m_TempData = tempData;
        }

        public override bool Equals(object obj)
        {
            return m_TempData.Equals(obj);
        }

        public override int GetHashCode()
        {
            return m_TempData.GetHashCode();
        }

        public override string ToString()
        {
            return base.ToString();
        }

        public string AccountMessage
        {
            get { return m_TempData[TempDataKeys.AccountMessage] as string; }
            set { m_TempData[TempDataKeys.AccountMessage] = value; }
        }
    }
}