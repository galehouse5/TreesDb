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
    public class EmailVerificationEmail : MailMessage
    {
        private EmailVerificationEmail(string from, string to, string subject, string body)
            : base(from, to, subject, body)
        {
            base.IsBodyHtml = true;
        }

        public static EmailVerificationEmail Create(User u)
        {
            StringBuilder body = new StringBuilder();
            string path = HttpContext.Current.Server.MapPath("~/EmailTemplates/EmailVerification.htm");
            using (StreamReader sr = new StreamReader(path))
            {
                body.Append(sr.ReadToEnd());
            }
            body.Replace("<%HostName%>", WebApplicationRegistry.Settings.HostName);
            body.Replace("<%EmailVerificationToken%>", u.EmailVerificationToken.UrlEncodedValue);
            body.Replace("<%WebmasterEmail%>", WebApplicationRegistry.Settings.WebmasterEmail);
            return new EmailVerificationEmail(
                WebApplicationRegistry.Settings.WebmasterEmail,
                u.Email,
                "Tree Measurement Database - Email verification",
                body.ToString());
        }
    }
}