using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Infrastructure.StringComparison.Expressions;

namespace TMD.Infrastructure.StringComparison
{
    public class StringComparisonExpression
    {
        private Expression m_Expression;

        public string Print()
        {
            return m_Expression.Print();
        }

        public double Evaluate(string firstWord, string secondWord)
        {
            return m_Expression.Evaluate(firstWord, secondWord);
        }

        public override string ToString()
        {
            return Print();
        }

        public static StringComparisonExpression Create(string expression)
        {
            Tokenizer t = new Tokenizer(expression);
            t.NextToken();
            Expression e = new Expression();
            e.Parse(t);
            return new StringComparisonExpression()
            {
                m_Expression = e
            };
        }
    }
}
