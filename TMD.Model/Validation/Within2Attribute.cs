using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Validation
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = true)]
    public class Within2Attribute : WithinAttribute
    {
        public Within2Attribute()
            : base()
        { }

        public Within2Attribute(double min, double max)
            : base(min, max)
        { }
    }
}
