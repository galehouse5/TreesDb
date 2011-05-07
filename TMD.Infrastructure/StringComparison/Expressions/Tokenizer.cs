using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Infrastructure.StringComparison.Expressions
{
    internal class Tokenizer
    {
        private int m_Index = -1;

        public Tokenizer(string expression)
        {
            this.Expression = expression;
        }

        public string Expression { get; private set; }
        public EToken CurrentToken { get; private set; }
        public string CurrentValue { get; private set; }

        public EToken NextToken()
        {
            if (CurrentToken != EToken.END)
            {
                m_Index++;
            }
            if (m_Index >= Expression.Length)
            {
                CurrentToken = EToken.END;
                CurrentValue = string.Empty;
            }
            else
            {
                while (m_Index + 1 < Expression.Length && isWhitespace(Expression[m_Index]))
                {
                    m_Index++;
                }
                switch (Expression[m_Index])
                {
                    case '-' :
                        CurrentToken = EToken.MINUS;
                        CurrentValue = string.Empty;
                        break;
                    case '+' :
                        CurrentToken = EToken.PLUS;
                        CurrentValue = string.Empty;
                        break;
                    case '*' :
                        CurrentToken = EToken.TIMES;
                        CurrentValue = string.Empty;
                        break;
                    case '/' :
                        CurrentToken = EToken.SLASH;
                        CurrentValue = string.Empty;
                        break;
                    case '(' :
                        CurrentToken = EToken.LPAREN;
                        CurrentValue = string.Empty;
                        break;
                    case ')' :
                        CurrentToken = EToken.RPAREN;
                        CurrentValue = string.Empty;
                        break;
                    case '0' :
                    case '1' :
                    case '2' :
                    case '3' :
                    case '4' :
                    case '5' :
                    case '6' :
                    case '7' :
                    case '8' :
                    case '9' :
                        CurrentToken = EToken.CONST;
                        StringBuilder cb = new StringBuilder();
                        cb.Append(Expression[m_Index]);
                        while (m_Index + 1 < Expression.Length && isNumberOrPeriod(Expression[m_Index + 1]))
                        {
                            cb.Append(Expression[m_Index + 1]);
                            m_Index++;
                        }
                        CurrentValue = cb.ToString();
                        break;
                    default :
                        StringBuilder smb = new StringBuilder();
                        smb.Append(Expression[m_Index]);
                        while (m_Index + 1 < Expression.Length && isLetter(Expression[m_Index + 1]))
                        {
                            smb.Append(Expression[m_Index + 1]);
                            m_Index++;
                        }
                        if (smb.Length > 0)
                        {
                            switch (smb.ToString().ToLower())
                            {
                                case "levenstein" :
                                case "needlemanwunch" :
                                case "smithwaterman" :
                                case "smithwatermangotoh" :
                                case "smithwatermangotohwindowedaffine" :
                                case "jaro" :
                                case "jarowinkler" :
                                case "chapmanlengthdeviation" :
                                case "chapmanmeanlength" :
                                case "qgramsdistance" :
                                case "blockdistance" :
                                case "cosinesimilarity" :
                                case "dicesimilarity" :
                                case "euclideandistance" :
                                case "jaccardsimilarity" :
                                case "matchingcoefficient" :
                                case "mongeelkan" :
                                case "overlapcoefficient" :
                                case "equality" :
                                case "firstcontains" :
                                case "secondcontains" :
                                    CurrentToken = EToken.SIMMETRIC;
                                    CurrentValue = smb.ToString().ToLower();
                                    break;
                                case "sumlength" :
                                case "minlength" :
                                case "maxlength" :
                                case "firstlength" :
                                case "secondlength" :
                                    CurrentToken = EToken.FUNCTION;
                                    CurrentValue = smb.ToString().ToLower();
                                    break;
                                default:
                                    CurrentToken = EToken.ERROR;
                                    CurrentValue = string.Empty;
                                    break;
                            }
                        }
                        else
                        {
                            CurrentToken = EToken.ERROR;
                            CurrentValue = string.Empty;
                        }
                        break;
                }
            }
            return CurrentToken;
        }

        private static bool isWhitespace(char c)
        {
            switch (c)
            {
                case ' ':
                case '\t':
                case '\n':
                case '\r':
                    return true;
                default:
                    return false;
            }
        }

        private static bool isNumberOrPeriod(char c)
        {
            if (c == '.')
            {
                return true;
            }
            int code = (int)c;
            if (code >= 48 && code <= 57)
            {
                return true;
            }
            return false;
        }

        private static bool isLetter(char c)
        {
            int code = (int)c;
            // uppercase
            if (code >= 65 && code <= 90)
            {
                return true;
            }
            /* lowercase */
            else  if (code >= 97 && code <= 122)
            {
                return true;
            }
            return false;
        }
    }
}
