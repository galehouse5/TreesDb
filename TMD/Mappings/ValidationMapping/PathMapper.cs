using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text.RegularExpressions;
using System.Text;
using System.Diagnostics;

namespace TMD.Mappings.ValidationMapping
{
    public interface IPathMapper
    {
        string Map(string sourcePropertyPath);
    }

    [DebuggerDisplay("source path -> source path")]
    public class SourcePathMapper : IPathMapper
    {
        public string Map(string sourcePropertyPath)
        {
            return sourcePropertyPath;
        }
    }

    [DebuggerDisplay("source path -> {DestinationPropertyPath}")]
    public class ConstantPathMapper : IPathMapper
    {
        public ConstantPathMapper(string destinationPropertyPath)
        {
            this.DestinationPropertyPath = destinationPropertyPath;
        }

        public string DestinationPropertyPath { get; private set; }

        public string Map(string sourcePropertyPath)
        {
            return DestinationPropertyPath;
        }
    }

    [DebuggerDisplay("source path -> string.Empty")]
    public class EmptyPathMapper : IPathMapper
    {
        public string Map(string sourcePropertyPath)
        {
            return string.Empty;
        }
    }

    [DebuggerDisplay("{SourceWildcardPropertyPath} -> {DestinationWildcardPropertyPath}")]
    public class WildcardPathMapper : IPathMapper
    {
        private Regex m_SourcePropertyPathMatcher;
        private string[] m_DestinationPropertyPathParts;

        public WildcardPathMapper(string sourceWildcardPropertyPath, string destinationWildcardPropertyPath)
        {
            m_SourcePropertyPathMatcher = new Regex(
                regexEncode(sourceWildcardPropertyPath), 
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
            m_DestinationPropertyPathParts = destinationWildcardPropertyPath.Split('*');
            this.SourceWildcardPropertyPath = sourceWildcardPropertyPath;
            this.DestinationWildcardPropertyPath = destinationWildcardPropertyPath;
        }

        public string SourceWildcardPropertyPath { get; private set; }
        public string DestinationWildcardPropertyPath { get; private set; }

        private string regexEncode(string propertyPath)
        {
            return new StringBuilder(propertyPath)
                .Replace(".", "\\.").Replace("[", "\\[").Replace("]", "\\]").Replace("*", "(.+)")
                .Insert(0, '^').Append('$')
                .ToString();
        }

        public string Map(string sourcePropertyPath)
        {
            StringBuilder destinationPath = new StringBuilder(m_DestinationPropertyPathParts[0]);
            int partIndex = 1;
            foreach (Group group in m_SourcePropertyPathMatcher.Match(sourcePropertyPath).Groups)
            {
                if (partIndex >= m_DestinationPropertyPathParts.Length)
                {
                    break;
                }
                if (group.Value != sourcePropertyPath)
                {
                    destinationPath.Append(group.Value);
                    destinationPath.Append(m_DestinationPropertyPathParts[partIndex]);
                    partIndex++;
                }
            }
            return destinationPath.ToString();
        }
    }

    public class PathMapperFactory
    {
        public IPathMapper Create(string sourcePropertyPath, string destinationPropertyPath)
        {
            if (sourcePropertyPath.Equals("*"))
            {
                return new ConstantPathMapper(destinationPropertyPath);
            }
            if (sourcePropertyPath.Equals(destinationPropertyPath, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(sourcePropertyPath))
            {
                return new SourcePathMapper();
            }
            if (sourcePropertyPath.Contains("*") && destinationPropertyPath.Contains("*"))
            {
                return new WildcardPathMapper(sourcePropertyPath, destinationPropertyPath);
            }
            if (!string.IsNullOrEmpty(sourcePropertyPath))
            {
                return new ConstantPathMapper(destinationPropertyPath);
            }
            return new EmptyPathMapper();       
        }
    }
}