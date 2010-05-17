using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.SQLCLR.Expressions
{
    internal enum EToken
    {
        START,
        PLUS,
        MINUS,
        TIMES,
        SLASH,
        LPAREN,
        RPAREN,
        CONST,
        SIMMETRIC,
        FUNCTION,
        END,
        ERROR
    }
}
