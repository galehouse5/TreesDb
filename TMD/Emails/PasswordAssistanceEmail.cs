using System.IO;
using System.Net.Mail;
using System.Text;
using System.Web;
using TMD.Model.Users;

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
            string path = HttpContext.Current.Server.MapPath("~/Emails/PasswordAssistance.htm");
            using (StreamReader sr = new StreamReader(path))
            {
                body.Append(sr.ReadToEnd());
            }
            body.Replace("<%HostName%>", WebApplicationRegistry.Hostname);
            body.Replace("<%CompletePasswordAssistancePath%>", completePasswordAssistancePath);
            body.Replace("<%WebmasterEmail%>", WebApplicationRegistry.WebmasterEmail);
            return new PasswordAssistanceEmail(
                WebApplicationRegistry.WebmasterEmail,
                u.Email,
                "[Tree Measurement Database] Password Assistance",
                body.ToString());
        }
    }
}