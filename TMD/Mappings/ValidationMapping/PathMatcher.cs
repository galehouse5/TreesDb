using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text.RegularExpressions;
using System.Text;
using System.Diagnostics;

namespace TMD.Mappings.ValidationMapping
{
    public interface IPathMatcher
    {
        bool Matches(string propertyPath);
    }

    [DebuggerDisplay("always")]
    public class AlwaysPathMatcher : IPathMatcher
    {
        public bool Matches(string propertyPath)
        {
            return true;
        }
    }

    [DebuggerDisplay("never")]
    public class NeverPathMatcher : IPathMatcher
    {
        public bool Matches(string propertyPath)
        {
            return false;
        }
    }

    [DebuggerDisplay("property path == {PropertyPath}")]
    public class ExactPathMatcher : IPathMatcher
    {
        public ExactPathMatcher(string propertyPath)
        {
            this.PropertyPath = propertyPath;
        }

        public string PropertyPath { get; private set; }

        public bool Matches(string propertyPath)
        {
            return PropertyPath.Equals(propertyPath, StringComparison.OrdinalIgnoreCase);
        }
    }

    [DebuggerDisplay("property path like {WildcardPropertyPath}")]
    public class WildcardPathMatcher : IPathMatcher
    {
        private Regex m_PropertyPathMatcher;

        public WildcardPathMatcher(string wildcardPropertyPath)
        {
            m_PropertyPathMatcher = new Regex(
                regexEncode(wildcardPropertyPath), 
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
            this.WildcardPropertyPath = wildcardPropertyPath;
        }

        public string WildcardPropertyPath { get; private set; }

        private string regexEncode(string propertyPath)
        {
            return new StringBuilder(propertyPath)
                .Replace(".", "\\.").Replace("*", ".+")
                .Insert(0, '^').Append('$')
                .ToString();
        }

        public bool Matches(string propertyPath)
        {
            return m_PropertyPathMatcher.IsMatch(propertyPath);
        }
    }

    public class PathMatcherFactory
    {
        public IPathMatcher Create(string propertyPath)
        {
            if (propertyPath.Equals("*"))
            {
                return new AlwaysPathMatcher();
            }
            if (propertyPath.Contains('*'))
            {
                return new WildcardPathMatcher(propertyPath);
            }
            if (!string.IsNullOrEmpty(propertyPath))
            {
                return new ExactPathMatcher(propertyPath);
            }
            return new NeverPathMatcher();
        }
    }
}