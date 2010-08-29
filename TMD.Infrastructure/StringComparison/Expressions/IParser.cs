using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Infrastructure.StringComparison.Expressions
{
    internal interface IParser
    {
        void Parse(Tokenizer t);
    }
}
