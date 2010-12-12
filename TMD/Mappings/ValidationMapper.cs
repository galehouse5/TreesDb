using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using TMD.Mappings.ValidationMapping;
using TMD.Model.Validation;

namespace TMD.Mappings
{
    public class ValidationMappingExpression<TSource, TDestination> : ValidationMappingExpression
    {
        public override Type Source { get { return typeof(TSource); } }
        public override Type Destination { get { return typeof(TDestination); } }

        public new ValidationMappingExpression<TSource, TDestination> ForPath(string sourcePath, string destinationPath)
        {
            return (ValidationMappingExpression<TSource, TDestination>)base.ForPath(sourcePath, destinationPath);
        }

        public new ValidationMappingExpression IgnorePath(string sourcePath)
        {
            return (ValidationMappingExpression<TSource, TDestination>)base.IgnorePath(sourcePath);
        }
    }

    public abstract class ValidationMappingExpression
    {
        public ValidationMappingExpression()
        {
            Paths = new List<Tuple<IPathMatcher, IPathMapper>>();
            Paths.Add(new Tuple<IPathMatcher, IPathMapper>(
                new AlwaysPathMatcher(),
                new SourcePathMapper()));
            Messages = new List<Tuple<IPathMatcher, IMessageMapper>>();
            Messages.Add(new Tuple<IPathMatcher, IMessageMapper>(
                new AlwaysPathMatcher(),
                new SourceMessageMapper()));
        }

        public abstract Type Source { get; }
        public abstract Type Destination { get; }
        public IList<Tuple<IPathMatcher, IPathMapper>> Paths { get; private set; }
        public IList<Tuple<IPathMatcher, IMessageMapper>> Messages { get; private set; }

        public ValidationMappingExpression ForPath(string sourcePath, string destinationPath)
        {
            Paths.Add(new Tuple<IPathMatcher, IPathMapper>(
                new PathMatcherFactory().Create(sourcePath), 
                new PathMapperFactory().Create(sourcePath, destinationPath)));
            return this;
        }

        public ValidationMappingExpression IgnorePath(string sourcePath)
        {
            Paths.Add(new Tuple<IPathMatcher, IPathMapper>(
                new NeverPathMatcher(), 
                new EmptyPathMapper()));
            return this;
        }

        public ValidationMappingExpression UseMessage(string sourcePath, string message)
        {
            Messages.Add(new Tuple<IPathMatcher, IMessageMapper>(
                new PathMatcherFactory().Create(sourcePath),
                new ConstantMessageMapper(message)));
            return this;
        }

        public string MapMessage(string sourcePath, string message)
        {
            return Messages.Last(m => m.Item1.Matches(sourcePath)).Item2.Map(message);
        }

        public string MapPath(string sourcePath)
        {
            return Paths.Last(p => p.Item1.Matches(sourcePath)).Item2.Map(sourcePath);
        }
    }

    public class MappedValidationError : IValidationError
    {
        internal MappedValidationError(IValidationError error)
        {
            MappedError = error;
            Tags = MappedError.Tags;
            PropertyPath = MappedError.PropertyPath;
            Value = MappedError.Value;
            Message = MappedError.Message;
        }

        public IValidationError MappedError { get; private set; }
        public ICollection<object> Tags { get; internal set; }
        public string PropertyPath { get; internal set; }
        public object Value { get; internal set; }
        public string Message { get; internal set; }
    }

    public static class ValidationMapper
    {
        static ValidationMapper()
        {
            Expressions = new List<ValidationMappingExpression>();
        }

        public static IList<ValidationMappingExpression> Expressions { get; private set; }

        public static ValidationMappingExpression<TSource, TDestination> CreateMap<TSource, TDestination>()
        {
            var expression = new ValidationMappingExpression<TSource, TDestination>();
            Expressions.Add(expression);
            return expression;
        }

        public static ValidationMappingExpression<TSource, TDestination> GetExpression<TSource, TDestination>()
        {
            return (ValidationMappingExpression<TSource, TDestination>)Expressions
                .FirstOrDefault(vme => vme.Source == typeof(TSource) && vme.Destination == typeof(TDestination));
        }

        public static IEnumerable<IValidationError> Map<TSource, TDestination>(IEnumerable<IValidationError> errors)
        {
            ValidationMappingExpression vme = GetExpression<TSource, TDestination>();
            foreach (var error in errors)
            {
                string mappedPath = vme.MapPath(error.PropertyPath);
                if (!string.IsNullOrWhiteSpace(mappedPath))
                {
                    yield return new MappedValidationError(error)
                    {
                        PropertyPath = mappedPath,
                        Message = vme.MapMessage(error.PropertyPath, error.Message)
                    };
                }
            }
        }
    }
}