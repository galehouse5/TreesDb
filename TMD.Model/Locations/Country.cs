using System.Diagnostics;
using TMD.Model.Extensions;

namespace TMD.Model.Locations
{
    [DebuggerDisplay("{Code}")]
    public class Country : IEntity
    {
        protected Country()
        { }

        public int Id { get; protected set; }

        private string m_DoubleLetterCode;
        public string DoubleLetterCode
        {
            get { return m_DoubleLetterCode; }
            protected set { m_DoubleLetterCode = value.OrEmptyAndTrimToUpper(); }
        }

        private string m_TripleLetterCode;
        public string TripleLetterCode
        {
            get { return m_TripleLetterCode; }
            protected set { m_TripleLetterCode = value.OrEmptyAndTrimToUpper(); }
        }

        public string Code
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
        public string Name
        {
            get { return m_Name; }
            protected set { m_Name = value.OrEmptyAndTrimToTitleCase(); }
        }

        public CoordinateBounds CoordinateBounds { get; protected set; }

        public override string ToString()
        {
            return Name;
        }
    }
}
