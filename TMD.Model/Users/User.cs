using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;

namespace TMD.Model.Users
{
    [Serializable]
    public class User : EntityBase, IEntity
    {
        private User()
        { }

        private User(bool isAnonymous)
            : base(isAnonymous)
        {
            this.IsAnonymous = isAnonymous;
        }

        public bool IsAnonymous { get; private set; }

        [EmptyStringValidator("Email must be specified.")]
        [StringMaxLengthValidator("Email must not exceed 100 characters.", 100)]
        public string Email { get; set; }

        [StringMaxLengthValidator("First name must not exceed 100 characters.", 100)]
        public string FirstName { get; set; }

        [StringMaxLengthValidator("Last name must not exceed 100 characters.", 100)]
        public string LastName { get; set; }

        public EUserRoles Roles { get; set; }

        public bool IsDataAdmin 
        {
            get { return (Roles & EUserRoles.DataAdmin) == EUserRoles.DataAdmin; }
        }

        public bool IsUserAdmin 
        {
            get { return (Roles & EUserRoles.UserAdmin) == EUserRoles.UserAdmin; }
        }

        public bool IsImporter
        {
            get { return (Roles & EUserRoles.Importer) == EUserRoles.Importer; }
        }

        public bool IsExporter
        {
            get { return (Roles & EUserRoles.Exporter) == EUserRoles.Exporter; }
        }

        public void AssertRole(EUserRoles role)
        {
            if ((Roles & role) != role)
            {
                throw new ApplicationException(string.Format("User {0} {1} role assertion failed.", Id, role.ToString()));
            }
        }

        public static User Create()
        {
            User u = new User();
            u.Roles = EUserRoles.None;
            return u;
        }

        public static User Anonymous()
        {
            User u = new User(true);
            u.Roles = EUserRoles.None;
            return u;
        }
    }
}
