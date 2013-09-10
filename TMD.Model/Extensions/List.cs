using System;
using System.Collections.Generic;

namespace TMD.Model.Extensions
{
    public static class ListExtensions
    {
        public static IList<T> AddRange<T>(this IList<T> destination, IEnumerable<T> source)
        {
            foreach (T item in source)
            {
                destination.Add(item);
            }
            return destination;
        }

        public static IList<T> RemoveAll<T>(this IList<T> source, Predicate<T> predicate)
        {
            for (int i = source.Count - 1; i >= 0; i--)
            {
                if (predicate(source[i]))
                {
                    source.RemoveAt(i);
                }
            }
            return source;
        }

        public static IList<T> RemoveAll<T>(this IList<T> source)
        {
            for (int i = source.Count - 1; i >= 0; i--)
            {
                source.RemoveAt(i);
            }
            return source;
        }
    }
}
