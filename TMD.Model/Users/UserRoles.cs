using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Imports;

namespace TMD.Model.Users
{
    [Flags]
    public enum UserRoles
    {
        None = 0x0,
        Import = 0x1,
        Export = 0x2,
        Admin = 0x4
    }

    public partial class User
    {
        private List<UserRole> m_Roles = new List<UserRole>();

        protected virtual UserRoles Roles 
        {
            get { return (UserRoles)m_Roles.Sum(r => (int)r.Role); }
            set
            {
                m_Roles.Clear();
                if ((value & UserRoles.Import) == UserRoles.Import)
                {
                    m_Roles.Add(new ImportUserRole());
                }
                if ((value & UserRoles.Export) == UserRoles.Export)
                {
                    m_Roles.Add(new ExportUserRole());
                }
                if ((value & UserRoles.Admin) == UserRoles.Admin)
                {
                    m_Roles.Add(new AdminUserRole());
                }
            }
        }

        public virtual bool IsInRole(UserRoles role)
        {
            return (Roles & role) == role;
        }

        public virtual bool IsAuthorizedToImport { get { return m_Roles.Count(r => r.IsAuthorizedToImport(this)) > 0; } }   
        public virtual bool IsAuthorizedToEdit(Trip t) { return m_Roles.Count(r => r.IsAuthorizedToEdit(this, t)) > 0; }
        public virtual bool IsAuthorizedToExport { get { return m_Roles.Count(r => r.IsAuthorizedToExport(this)) > 0; } }   
    }

    public abstract class UserRole
    {
        public abstract UserRoles Role { get; }
        public virtual bool IsAuthorizedToImport(User user) { return false; }
        public virtual bool IsAuthorizedToExport(User user) { return false; }
        public virtual bool IsAuthorizedToEdit(User user, Trip trip) { return false; }
    }

    public class ImportUserRole : UserRole
    {
        internal ImportUserRole()
        { }

        public override UserRoles Role { get { return UserRoles.Import; } }
        public override bool IsAuthorizedToImport(User user) { return true; }
        public override bool IsAuthorizedToEdit(User user, Trip trip) { return user == trip.Creator; }
    }

    public class ExportUserRole : UserRole
    {
        internal ExportUserRole()
        { }

        public override UserRoles Role { get { return UserRoles.Export; } }
        public override bool IsAuthorizedToExport(User user) { return true; }
    }

    public class AdminUserRole : UserRole
    {
        internal AdminUserRole()
        { }

        public override UserRoles Role { get { return UserRoles.Admin; } }
    }
}
