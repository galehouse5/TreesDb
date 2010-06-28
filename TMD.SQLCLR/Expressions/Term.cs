using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.SQLCLR.Expressions
{
    public enum FactorOperation
    {
        Division,
        Multiplication,
        None
    }

    internal class Term : IParser, IPrinter, IEvaluator
    {
        public Term()
        {
            Factors = new List<Factor>();
            Operations = new List<FactorOperation>();
        }

        public List<Factor> Factors { get; private set; }
        public List<FactorOperation> Operations { get; private set; }

        public void Parse(Tokenizer t)
        {
            Operations.Add(FactorOperation.None);
            Factor parent = new Factor();
            Factors.Add(parent);
            parent.Parse(t);
            while (t.CurrentToken == EToken.TIMES || t.CurrentToken == EToken.SLASH)
            {
                Operations.Add(t.CurrentToken == EToken.TIMES ? FactorOperation.Multiplication : FactorOperation.Division);
                t.NextToken();
                Factor child = new Factor();
                Factors.Add(child);
                child.Parse(t);
            }
            // optimization
            Factors.TrimExcess();
            Operations.TrimExcess();
        }

        public string Print()
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Factors.Count; i++)
            {
                switch (Operations[i])
                {
                    case FactorOperation.Division :
                        sb.Append(" / ");
                        break;
                    case  FactorOperation.Multiplication :
                        sb.Append(" * ");
                        break;
                    default :
                        break;
                }
                sb.Append(Factors[i].Print());
            }
            return sb.ToString();
        }

        public double Evaluate(string firstWord, string secondWord)
        {
            double rank = 0d;
            for (int i = 0; i < Factors.Count; i++)
            {
                switch (Operations[i])
                {
                    case FactorOperation.Division :
                        rank /= Factors[i].Evaluate(firstWord, secondWord);
                        break;
                    case FactorOperation.Multiplication :
                        rank *= Factors[i].Evaluate(firstWord, secondWord);
                        break;
                    case FactorOperation.None :
                        rank = Factors[i].Evaluate(firstWord, secondWord);
                        break;
                }
            }
            return rank;
        }
    }
}
