using System.Web.Mvc;
using TMD.Model.Users;

namespace TMD.Extensions
{
    public static class ControllerExtensions
    {
        public static User User(this Controller controller)
        {
            return (WebUser)controller.User;
        }
    }
}