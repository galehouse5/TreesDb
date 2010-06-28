using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SimMetricsApi;

namespace TMD.SQLCLR.Expressions
{
    public enum FactorType
    {
        Constant,
        SimilarityMetric,
        Expression,
        Function
    }

    public enum FactorFunctionType
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

        public FactorType Type { get; private set; }
        public double ConstantValue { get; private set; }
        public IStringMetric SimilarityMetric { get; private set; }
        public Expression Expression { get; private set; }
        public FactorFunctionType FunctionType { get; private set; }

        public void Parse(Tokenizer t)
        {
            if (t.CurrentToken == EToken.CONST)
            {
                Type = FactorType.Constant;
                ConstantValue = double.Parse(t.CurrentValue);
                t.NextToken();
            }
            else if (t.CurrentToken == EToken.SIMMETRIC)
            {
                Type = FactorType.SimilarityMetric;
                SimilarityMetric = s_SimilarityMetricFactory.Create(t.CurrentValue);
                t.NextToken();
            }
            else if (t.CurrentToken == EToken.FUNCTION)
            {
                Type = FactorType.Function;
                switch (t.CurrentValue)
                {
                    case "sumlength":
                        FunctionType = FactorFunctionType.SumLength;
                        break;
                    case "minlength":
                        FunctionType = FactorFunctionType.MinLength;
                        break;
                    case "maxlength":
                        FunctionType = FactorFunctionType.MaxLength;
                        break;
                    case "firstlength":
                        FunctionType = FactorFunctionType.FirstLength;
                        break;
                    case "secondlength":
                        FunctionType = FactorFunctionType.SecondLength;
                        break;
                }
                t.NextToken();
            }
            else if (t.CurrentToken == EToken.LPAREN)
            {
                Type = FactorType.Expression;
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
                case FactorType.Constant :
                    sb.Append(ConstantValue.ToString());
                    break;
                case FactorType.SimilarityMetric :
                    sb.Append(SimilarityMetric.GetType().Name);
                    break;
                case FactorType.Expression :
                    sb.Append("(");
                    sb.Append(Expression.Print());
                    sb.Append(")");
                    break;
                case FactorType.Function :
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
                case FactorType.Constant :
                    rank = ConstantValue;
                    break;
                case FactorType.SimilarityMetric :
                    rank = SimilarityMetric.GetSimilarity(firstWord, secondWord);
                    break;
                case FactorType.Expression :
                    rank = Expression.Evaluate(firstWord, secondWord);
                    break;
                case FactorType.Function :
                    switch (FunctionType)
                    {
                        case FactorFunctionType.MaxLength :
                            rank = Math.Max(firstWord.Length, secondWord.Length);
                            break;
                        case FactorFunctionType.MinLength :
                            rank = Math.Min(firstWord.Length, secondWord.Length);
                            break;
                        case FactorFunctionType.SumLength :
                            rank = firstWord.Length + secondWord.Length;
                            break;
                        case FactorFunctionType.FirstLength :
                            rank = firstWord.Length;
                            break;
                        case FactorFunctionType.SecondLength :
                            rank = secondWord.Length;
                            break;
                    }
                    break;
            }
            return rank;
        }
    }
}
