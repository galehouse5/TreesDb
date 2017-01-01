using System;
using System.Collections.Generic;

namespace TMD.Model.Extensions
{
    public static class EnumerableExtensions
    {
        public static IEnumerable<T> ForEach<T>(this IEnumerable<T> source, Action<T> action)
        {
            foreach (T item in source)
            {
                action(item);
            }

            return source;
        }

        public static IEnumerable<T> ForEach<T>(this IEnumerable<T> source, Action<T, int> action)
        {
            int index = 0;

            foreach (T item in source)
            {
                action(item, index);
                index++;
            }

            return source;
        }
    }
}
