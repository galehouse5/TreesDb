using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Sites
{
    public class Subsite : IEntity
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
    }
}
