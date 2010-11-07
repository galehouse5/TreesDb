using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Extensions;
using NHibernate.Validator.Engine;

namespace TMD.Model.Validation
{
    public class ValidationFailure
    {
        private InvalidValue m_IV;

        internal ValidationFailure(InvalidValue iv)
        {
            m_IV = iv;
        }

        public object Entity
        {
            get { return m_IV.Entity; }
        }

        public string Message
        {
            get { return m_IV.Message; }
        }

        public string Property
        {
            get { return m_IV.PropertyName; }
        }

        public string Path
        {
            get { return m_IV.PropertyPath; }
        }

        public object Value
        {
            get { return m_IV.Value; }
        }

        public IList<Tag> Rulesets
        {
            get
            {
                List<Tag> rulesets = new List<Tag>();
                m_IV.MatchTags.ForEach(o => rulesets.Add((Tag)o));
                return rulesets;
            }
        }
    }
}
