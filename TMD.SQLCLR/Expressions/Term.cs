using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.SQLCLR.Expressions
{
    public enum EFactorOperation
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
            Operations = new List<EFactorOperation>();
        }

        public List<Factor> Factors { get; private set; }
        public List<EFactorOperation> Operations { get; private set; }

        public void Parse(Tokenizer t)
        {
            Operations.Add(EFactorOperation.None);
            Factor parent = new Factor();
            Factors.Add(parent);
            parent.Parse(t);
            while (t.CurrentToken == EToken.TIMES || t.CurrentToken == EToken.SLASH)
            {
                Operations.Add(t.CurrentToken == EToken.TIMES ? EFactorOperation.Multiplication : EFactorOperation.Division);
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
                    case EFactorOperation.Division :
                        sb.Append(" / ");
                        break;
                    case  EFactorOperation.Multiplication :
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
                    case EFactorOperation.Division :
                        rank /= Factors[i].Evaluate(firstWord, secondWord);
                        break;
                    case EFactorOperation.Multiplication :
                        rank *= Factors[i].Evaluate(firstWord, secondWord);
                        break;
                    case EFactorOperation.None :
                        rank = Factors[i].Evaluate(firstWord, secondWord);
                        break;
                }
            }
            return rank;
        }
    }
}
