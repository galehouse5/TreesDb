using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SimMetricsApi;

namespace TMD.SQLCLR.Expressions
{
    public enum EFactorType
    {
        Constant,
        SimilarityMetric,
        Expression,
        Function
    }

    public enum EFactorFunctionType
    {
        SumLength,
        MinLength,
        MaxLength,
        FirstLength,
        SecondLength
    }

    internal class Factor : IParser, IPrinter, IEvaluator
    {
        private static readonly SimilarityMetricFactory s_SimilarityMetricFactory = new SimilarityMetricFactory();

        public EFactorType Type { get; private set; }
        public double ConstantValue { get; private set; }
        public IStringMetric SimilarityMetric { get; private set; }
        public Expression Expression { get; private set; }
        public EFactorFunctionType FunctionType { get; private set; }

        public void Parse(Tokenizer t)
        {
            if (t.CurrentToken == EToken.CONST)
            {
                Type = EFactorType.Constant;
                ConstantValue = double.Parse(t.CurrentValue);
                t.NextToken();
            }
            else if (t.CurrentToken == EToken.SIMMETRIC)
            {
                Type = EFactorType.SimilarityMetric;
                SimilarityMetric = s_SimilarityMetricFactory.Create(t.CurrentValue);
                t.NextToken();
            }
            else if (t.CurrentToken == EToken.FUNCTION)
            {
                Type = EFactorType.Function;
                switch (t.CurrentValue)
                {
                    case "sumlength":
                        FunctionType = EFactorFunctionType.SumLength;
                        break;
                    case "minlength":
                        FunctionType = EFactorFunctionType.MinLength;
                        break;
                    case "maxlength":
                        FunctionType = EFactorFunctionType.MaxLength;
                        break;
                    case "firstlength":
                        FunctionType = EFactorFunctionType.FirstLength;
                        break;
                    case "secondlength":
                        FunctionType = EFactorFunctionType.SecondLength;
                        break;
                }
                t.NextToken();
            }
            else if (t.CurrentToken == EToken.LPAREN)
            {
                Type = EFactorType.Expression;
                t.NextToken();
                Expression = new Expression();
                Expression.Parse(t);
                if (t.CurrentToken != EToken.RPAREN)
                {
                    throw new ApplicationException(string.Format("Invalid token: {0}", t.CurrentToken.ToString()));
                }
                t.NextToken();
            }
            else
            {
                throw new ApplicationException(string.Format("Invalid token: {0}", t.CurrentToken.ToString()));
            }
        }

        public string Print()
        {
            StringBuilder sb = new StringBuilder();
            switch (Type)
            {
                case EFactorType.Constant :
                    sb.Append(ConstantValue.ToString());
                    break;
                case EFactorType.SimilarityMetric :
                    sb.Append(SimilarityMetric.GetType().Name);
                    break;
                case EFactorType.Expression :
                    sb.Append("(");
                    sb.Append(Expression.Print());
                    sb.Append(")");
                    break;
                case EFactorType.Function :
                    sb.Append(FunctionType.ToString());
                    break;
            }
            return sb.ToString();
        }

        public double Evaluate(string firstWord, string secondWord)
        {
            double rank = 0d;
            switch (Type)
            {
                case EFactorType.Constant :
                    rank = ConstantValue;
                    break;
                case EFactorType.SimilarityMetric :
                    rank = SimilarityMetric.GetSimilarity(firstWord, secondWord);
                    break;
                case EFactorType.Expression :
                    rank = Expression.Evaluate(firstWord, secondWord);
                    break;
                case EFactorType.Function :
                    switch (FunctionType)
                    {
                        case EFactorFunctionType.MaxLength :
                            rank = Math.Max(firstWord.Length, secondWord.Length);
                            break;
                        case EFactorFunctionType.MinLength :
                            rank = Math.Min(firstWord.Length, secondWord.Length);
                            break;
                        case EFactorFunctionType.SumLength :
                            rank = firstWord.Length + secondWord.Length;
                            break;
                        case EFactorFunctionType.FirstLength :
                            rank = firstWord.Length;
                            break;
                        case EFactorFunctionType.SecondLength :
                            rank = secondWord.Length;
                            break;
                    }
                    break;
            }
            return rank;
        }
    }
}
