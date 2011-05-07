using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Validation
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = true)]
    public class Size2Attribute : SizeAttribute
    {
        public Size2Attribute()
            : base()
        { }

        public Size2Attribute(int min, int max)
            : base(min, max)
        { }
    }
}
