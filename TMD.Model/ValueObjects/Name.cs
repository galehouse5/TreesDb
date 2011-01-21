using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Validation;
using TMD.Model.Extensions;
using NHibernate.Validator.Constraints;

namespace TMD.Model
{
    [DebuggerDisplay("{LastName}, {FirstName}")]
    public class Name : ISpecified
    {
        protected Name()
        { }

        [NotEmptyOrWhitesapce(Message = "First name must be specified.", Tags = Tag.Screening)]
        [Length(50, Message = "First name must not exceed 50 characters.", Tags = Tag.Persistence)]
        public virtual string FirstName { get; private set; }

        [NotEmptyOrWhitesapce(Message = "Last name must be specified.", Tags = Tag.Screening)]
        [Length(50, Message = "Last name must not exceed 50 characters.", Tags = Tag.Persistence)]
        public virtual string LastName { get; private set; }

        public virtual bool IsSpecified
        {
            get { return !string.IsNullOrWhiteSpace(FirstName) || !string.IsNullOrWhiteSpace(LastName); }
        }

        public virtual string ToFormalName()
        {
            return !string.IsNullOrWhiteSpace(FirstName) && !string.IsNullOrWhiteSpace(LastName) ?
                string.Format("{1}, {0}", FirstName, LastName) :
                string.Empty;
        }

        public override string ToString()
        {
            return !string.IsNullOrWhiteSpace(FirstName) && !string.IsNullOrWhiteSpace(LastName) ?
                string.Format("{0} {1}", FirstName, LastName) :
                string.Empty;
        }

        public static Name CreateFromFormalName(string name)
        {
            if (!string.IsNullOrWhiteSpace(name))
            {
                string[] parts = name.Split(',');
                if (parts.Length > 1)
                {
                    return Name.Create(parts[1], parts[0]);
                }
            }
            return Null();
        }

        public static Name Create(string first, string last)
        {
            return new Name
            {
                FirstName = first.OrEmptyAndTrimToTitleCase(),
                LastName = last.OrEmptyAndTrimToTitleCase()
            };
        }

        public static Name Null()
        {
            return new Name { FirstName = string.Empty, LastName = string.Empty };
        }

        public override bool Equals(object obj)
        {
            Name other = obj as Name;
            if (other != null)
            {
                return other.FirstName.Equals(FirstName)
                    && other.LastName.Equals(LastName);
            }
            return false;
        }

        public override int GetHashCode()
        {
            return FirstName.GetHashCode()
                ^ LastName.GetHashCode();
        }
    }
}
