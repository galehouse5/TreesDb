using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Users
{
    public class User
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public EUserRoles Roles { get; set; }
    }
}
