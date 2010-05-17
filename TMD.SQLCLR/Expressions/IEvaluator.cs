using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.SQLCLR.Expressions
{
    internal interface IEvaluator
    {
        double Evaluate(string firstWord, string secondWord);
    }
}
