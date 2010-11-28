using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TMD
{
    public static partial class SessionKeys
    {
        public const string PerformBrowserCheck = "performBrowserCheck";
        public const string DefaultReturnUrl = "defaultReturnUrl";
    }

    public partial class Session : HttpSessionStateBase
    {
        private HttpSessionStateBase m_Session;

        public Session(HttpSessionStateBase session)
        {
            m_Session = session;
        }

        #region Overrides

        public override void Abandon()
        {
            m_Session.Abandon();
        }

        public override void Add(string name, object value)
        {
            m_Session.Add(name, value);
        }

        public override void Clear()
        {
            m_Session.Clear();
        }

        public override int CodePage
        {
            get
            {
                return m_Session.CodePage;
            }
            set
            {
                m_Session.CodePage = value;
            }
        }

        public override HttpSessionStateBase Contents
        {
            get
            {
                return m_Session.Contents;
            }
        }

        public override HttpCookieMode CookieMode
        {
            get
            {
                return m_Session.CookieMode;
            }
        }

        public override void CopyTo(Array array, int index)
        {
            m_Session.CopyTo(array, index);
        }

        public override int Count
        {
            get
            {
                return m_Session.Count;
            }
        }

        public override bool Equals(object obj)
        {
            return m_Session.Equals(obj);
        }

        public override System.Collections.IEnumerator GetEnumerator()
        {
            return m_Session.GetEnumerator();
        }

        public override int GetHashCode()
        {
            return m_Session.GetHashCode();
        }

        public override bool IsCookieless
        {
            get
            {
                return m_Session.IsCookieless;
            }
        }

        public override bool IsNewSession
        {
            get
            {
                return m_Session.IsNewSession;
            }
        }

        public override bool IsReadOnly
        {
            get
            {
                return m_Session.IsReadOnly;
            }
        }

        public override bool IsSynchronized
        {
            get
            {
                return m_Session.IsSynchronized;
            }
        }

        public override System.Collections.Specialized.NameObjectCollectionBase.KeysCollection Keys
        {
            get
            {
                return m_Session.Keys;
            }
        }

        public override int LCID
        {
            get
            {
                return m_Session.LCID;
            }
            set
            {
                m_Session.LCID = value;
            }
        }

        public override System.Web.SessionState.SessionStateMode Mode
        {
            get
            {
                return m_Session.Mode;
            }
        }

        public override void Remove(string name)
        {
            m_Session.Remove(name);
        }

        public override void RemoveAll()
        {
            m_Session.RemoveAll();
        }

        public override void RemoveAt(int index)
        {
            m_Session.RemoveAt(index);
        }

        public override string SessionID
        {
            get
            {
                return m_Session.SessionID;
            }
        }

        public override HttpStaticObjectsCollectionBase StaticObjects
        {
            get
            {
                return m_Session.StaticObjects;
            }
        }

        public override object SyncRoot
        {
            get
            {
                return m_Session.SyncRoot;
            }
        }

        public override object this[int index]
        {
            get
            {
                return base[index];
            }
            set
            {
                base[index] = value;
            }
        }

        public override object this[string name]
        {
            get
            {
                return base[name];
            }
            set
            {
                base[name] = value;
            }
        }

        public override int Timeout
        {
            get
            {
                return m_Session.Timeout;
            }
            set
            {
                m_Session.Timeout = value;
            }
        }

        public override string ToString()
        {
            return m_Session.ToString();
        }

        #endregion

        public bool PerformBrowserCheck
        {
            get { return (bool)(m_Session[SessionKeys.PerformBrowserCheck] ?? true); }
            set { m_Session[SessionKeys.PerformBrowserCheck] = value; }
        }

        public string DefaultReturnUrl
        {
            get { return (string)(m_Session[SessionKeys.DefaultReturnUrl] ?? "/"); }
            set { m_Session[SessionKeys.DefaultReturnUrl] = value; }
        }

        public void ClearRegardingUserSpecificData()
        {
            // do nothing for now
        }
    }
}