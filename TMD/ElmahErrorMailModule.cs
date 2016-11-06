using Elmah;
using System;
using System.Collections.Specialized;
using System.Reflection;
using System.Web;
using TMD.Extensions;
using TMD.Model.Users;

namespace TMD
{
    public class ElmahErrorMailModule : ErrorMailModule
    {
        private FieldInfo isAsyncFieldInfo;

        public ElmahErrorMailModule()
        {
            isAsyncFieldInfo = typeof(ErrorMailModule).GetField("_reportAsynchronously", BindingFlags.NonPublic | BindingFlags.Instance);
        }

        protected bool IsAsync
        {
            get { return (bool)isAsyncFieldInfo.GetValue(this); }
        }

        protected void SetRequestVariables(NameValueCollection values, HttpContextBase context)
        {
            values["REQUEST_ID"] = context.RequestID();

            User user = context.User as WebUser;
            if (user != null)
            {
                values["REQUEST_USER"] = user.ToString();
                values["REQUEST_USERIMPORTROLE"] = user.IsInRole(UserRoles.Import).ToString();
                values["REQUEST_USEREXPORTROLE"] = user.IsInRole(UserRoles.Export).ToString();
                values["REQUEST_USERADMINROLE"] = user.IsInRole(UserRoles.Admin).ToString();
                values["REQUEST_USERREGISTEREDROLE"] = user.IsInRole(UserRoles.Registered).ToString();
            }
        }

        protected Error GetError(Exception e, HttpContext context)
        {
            Error error = new Error(e, context);
            SetRequestVariables(error.ServerVariables, new HttpContextWrapper(context));
            return error;
        }

        protected override void OnError(Exception e, HttpContext context)
        {
            if (e == null)
                throw new ArgumentNullException("e");

            ExceptionFilterEventArgs args = new ExceptionFilterEventArgs(e, context);
            OnFiltering(args);

            if (args.Dismissed)
                return;

            Error error = GetError(e, context);

            if (IsAsync)
            {
                ReportErrorAsync(error);
            }
            else
            {
                ReportError(error);
            }
        }

        protected override ErrorTextFormatter CreateErrorFormatter()
        {
            return new ElmahErrorFormatter();
        }
    }
}
