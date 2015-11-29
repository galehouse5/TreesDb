using System.IO;
using System.Net.Mail;
using System.Text;
using System.Web;
using TMD.Model.Users;

namespace TMD.EmailTemplates
{
    public class EmailVerificationEmail : MailMessage
    {
        private EmailVerificationEmail(string from, string to, string subject, string body)
            : base(from, to, subject, body)
        {
            base.IsBodyHtml = true;
        }

        public static EmailVerificationEmail Create(User u, string completeRegistrationPath)
        {
            StringBuilder body = new StringBuilder();
            string path = HttpContext.Current.Server.MapPath("~/Emails/EmailVerification.htm");
            using (StreamReader sr = new StreamReader(path))
            {
                body.Append(sr.ReadToEnd());
            }
            body.Replace("<%HostName%>", WebApplicationRegistry.Hostname);
            body.Replace("<%CompleteRegistrationPath%>", completeRegistrationPath);
            body.Replace("<%WebmasterEmail%>", WebApplicationRegistry.WebmasterEmail);
            return new EmailVerificationEmail(
                WebApplicationRegistry.WebmasterEmail,
                u.Email,
                "[Tree Measurement Database] Email verification",
                body.ToString());
        }
    }
}