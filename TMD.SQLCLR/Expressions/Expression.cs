using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.SQLCLR.Expressions
{
    public enum ETermOperation
    {
        Positive,
        Negative,
        None
    }

    internal class Expression : IParser, IPrinter, IEvaluator
    {
        public Expression()
        {
            Terms = new List<Term>();
            Operations = new List<ETermOperation>();
        }

        public List<Term> Terms { get; private set; }
        public List<ETermOperation> Operations { get; private set; }

        public void Parse(Tokenizer t)
        {
            if (t.CurrentToken == EToken.MINUS || t.CurrentToken == EToken.PLUS)
            {
                Operations.Add(t.CurrentToken == EToken.MINUS ? ETermOperation.Negative : ETermOperation.Positive);
                t.NextToken();
            }
            else
            {
                Operations.Add(ETermOperation.None);
            }
            Term parent = new Term();
            Terms.Add(parent);
            parent.Parse(t);
            while (t.CurrentToken == EToken.MINUS || t.CurrentToken == EToken.PLUS)
            {
                Operations.Add(t.CurrentToken == EToken.MINUS ? ETermOperation.Negative : ETermOperation.Positive);
                t.NextToken();
                Term child = new Term();
                Terms.Add(child);
                child.Parse(t);
            }
            // optimization
            Terms.TrimExcess();
            Operations.TrimExcess();
        }

        public string Print()
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Terms.Count; i++)
            {
                if (i == 0)
                {
                    switch (Operations[0])
                    {
                        case ETermOperation.Negative :
                            sb.Append('-');
                            break;
                        case ETermOperation.Positive :
                            sb.Append('+');
                            break;
                        default :
                            break;
                    }
                    sb.Append(Terms[0].Print());
                }
                else
                {
                    sb.Append(Operations[0] == ETermOperation.Negative ? " - " : " + ");
                    sb.Append(Terms[i].Print());
                }
            }
            return sb.ToString();
        }

        public double Evaluate(string firstWord, string secondWord)
        {
            double rank = 0d;
            for (int i = 0; i < Terms.Count; i++)
            {
                switch (Operations[i])
                {
                    case ETermOperation.Negative :
                        rank -= Terms[i].Evaluate(firstWord, secondWord);
                        break;
                    default :
                        rank += Terms[i].Evaluate(firstWord, secondWord);
                        break;
                }
            }
            return rank;
        }
    }
}
