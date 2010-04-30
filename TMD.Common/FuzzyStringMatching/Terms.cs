using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common.FuzzyStringMatching
{
    public static class Terms
    {
        private static readonly char[] s_Splitters = new[] { ',', ' ' };

        public static string[] ToTerms(this string s)
        {
            string lower = s.ToLower();
            string[] terms = lower.Split(s_Splitters, StringSplitOptions.RemoveEmptyEntries);
            return terms;
        }
    }
}
