using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common.FuzzyStringMatching
{
    internal static class SetExtensions
    {
        public static void Sum(this IList<int> set, IList<int> set2)
        {
            while (set.Count < set2.Count)
            {
                set.Add(0);
            }
            for (int i = 0; i < set.Count; i++)
            {
                set[i] = set[i] + set2[i];
            }
        }

        public static void Product(this IList<int> set, int factor)
        {
            for (int i = 0; i < set.Count; i++)
            {
                set[i] = set[i] * factor;
            }
        }

        public static void Normalize(this IList<int> set, int min, int range)
        {
            int minWeight = int.MaxValue, maxWeight = int.MinValue;
            for (int i = 0; i < set.Count; i++)
            {
                minWeight = Math.Min(set[i], minWeight);
                maxWeight = Math.Max(set[i], maxWeight);
            }
            int maxRange = maxWeight - minWeight;
            if (maxRange == 0)
            {
                for (int i = 0; i < set.Count; i++)
                {
                    set[i] = min;
                }
            }
            else
            {
                for (int i = 0; i < set.Count; i++)
                {
                    float factor = ((float)set[i] - (float)minWeight) / (float)maxRange;
                    float normalized = (float)min + factor * (float)range;
                    set[i] = (int)normalized;
                }
            }
        }
    }
}
