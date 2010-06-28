using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.SQLCLR.Expressions;
using Wintellect.Threading.ResourceLocks;

namespace TMD.SQLCLR
{
    internal class ExpressionFactory
    {
        private ResourceLock m_ExpressionCacheLock = new OneManyResourceLock();
        private Dictionary<string, Expression> m_ExpressionCache = new Dictionary<string, Expression>();

        public Expression Create(string expression)
        {
            Expression e;
            bool instantiate = false;
            using (m_ExpressionCacheLock.WaitToRead())
            {
                instantiate = !m_ExpressionCache.TryGetValue(expression, out e);
            }
            if (instantiate)
            {
                using (m_ExpressionCacheLock.WaitToWrite())
                {
                    instantiate = !m_ExpressionCache.TryGetValue(expression, out e);
                    if (instantiate)
                    {
                        Tokenizer t = new Tokenizer(expression);
                        t.NextToken();
                        e = new Expression();
                        e.Parse(t);
                        m_ExpressionCache.Add(expression, e);
                    }
                }
            }
            return e;
        }
    }
}
