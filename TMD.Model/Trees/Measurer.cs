using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public class Measurer : IEntity
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
