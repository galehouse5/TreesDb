using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.SQLCLR.Expressions;

namespace TMD.SQLCLR
{
    internal class ExpressionFactory
    {
        private Dictionary<string, Expression> m_ExpressionCache = new Dictionary<string, Expression>();

        public Expression Create(string expression)
        {
            Expression e;
            if (!m_ExpressionCache.TryGetValue(expression, out e))
            {
                Tokenizer t = new Tokenizer(expression);
                t.NextToken();
                e = new Expression();
                e.Parse(t);
                m_ExpressionCache[expression] = e;
            }
            return e;
        }
    }
}
