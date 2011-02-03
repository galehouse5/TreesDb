using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Mail;
using TMD.Model.Users;
using System.Text;
using System.IO;

namespace TMD.EmailTemplates
{
    public class PasswordAssistanceEmail : MailMessage
    {
        private PasswordAssistanceEmail(string from, string to, string subject, string body)
            : base(from, to, subject, body)
        {
            base.IsBodyHtml = true;
        }

        public static PasswordAssistanceEmail Create(User u, string completePasswordAssistancePath)
        {
            StringBuilder body = new StringBuilder();
            string path = HttpContext.Current.Server.MapPath("~/EmailTemplates/PasswordAssistance.htm");
            using (StreamReader sr = new StreamReader(path))
            {
                body.Append(sr.ReadToEnd());
            }
            body.Replace("<%HostName%>", WebApplicationRegistry.Settings.HostName);
            body.Replace("<%CompletePasswordAssistancePath%>", completePasswordAssistancePath);
            body.Replace("<%WebmasterEmail%>", WebApplicationRegistry.Settings.WebmasterEmail);
            return new PasswordAssistanceEmail(
                WebApplicationRegistry.Settings.WebmasterEmail,
                u.Email,
                "[Tree Measurement Database] Password Assistance",
                body.ToString());
        }
    }
}