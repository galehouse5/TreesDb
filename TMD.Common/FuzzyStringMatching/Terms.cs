using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common.FuzzyStringMatching
{
    public static class Terms
    {
        public const int MinLength = 2;

        private static readonly char[] s_Splitters = new[] { ',', ' ' };

        public static string[] ToTerms(this string s)
        {
            string lower = s.ToLower();
            string[] terms = lower.Split(s_Splitters, StringSplitOptions.RemoveEmptyEntries);
            int nulledTerms = 0;
            for (int i = 0; i < terms.Length; i++)
            {
                if (terms[i].Length <= MinLength)
                {
                    terms[i] = null;
                    nulledTerms++;
                }
            }
            if (nulledTerms > 0)
            {
                string[] reducedTerms = new string[terms.Length - nulledTerms];
                int reducedTermsIndex = 0;
                for (int i = 0; i < terms.Length; i++)
                {
                    if (terms[i] != null)
                    {
                        reducedTerms[reducedTermsIndex] = terms[i];
                        reducedTermsIndex++;
                    }
                }
                return reducedTerms;
            }
            return terms;
        }
    }
}
