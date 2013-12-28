using System.Diagnostics;
using TMD.Model.Extensions;

namespace TMD.Model.Locations
{
    [DebuggerDisplay("{Code}")]
    public class Country : IEntity
    {
        protected Country()
        { }

        public virtual int Id { get; protected set; }

        private string m_DoubleLetterCode;
        public virtual string DoubleLetterCode
        {
            get { return m_DoubleLetterCode; }
            protected set { m_DoubleLetterCode = value.OrEmptyAndTrimToUpper(); }
        }

        private string m_TripleLetterCode;
        public virtual string TripleLetterCode
        {
            get { return m_TripleLetterCode; }
            protected set { m_TripleLetterCode = value.OrEmptyAndTrimToUpper(); }
        }

        public virtual string Code
        {
            get
            {
                if (!string.IsNullOrWhiteSpace(DoubleLetterCode))
                {
                    return DoubleLetterCode;
                }
                return TripleLetterCode;
            }
        }

        private string m_Name;
        public virtual string Name
        {
            get { return m_Name; }
            protected set { m_Name = value.OrEmptyAndTrimToTitleCase(); }
        }

        public virtual CoordinateBounds CoordinateBounds { get; protected set; }

        public override string ToString()
        {
            return Name;
        }
    }
}
