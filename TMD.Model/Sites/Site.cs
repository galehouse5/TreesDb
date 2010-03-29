using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Sites
{
    public class Site : IEntity
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public Country Country { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        public IList<Subsite> Subsites { get; private set; }
    }
}
