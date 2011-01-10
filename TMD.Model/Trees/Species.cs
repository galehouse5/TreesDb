using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Extensions;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({CommonName})}")]
    public class KnownSpecies : IEntity
    {
        protected KnownSpecies() 
        {}

        public virtual int Id { get; private set; }

        private string m_AcceptedSymbol;
        public virtual string AcceptedSymbol 
        {
            get { return m_AcceptedSymbol; }
            private set { m_AcceptedSymbol = value.OrEmptyAndTrimToUpper(); }
        }

        private string m_ScientificName;
        public virtual string ScientificName 
        {
            get { return m_ScientificName; }
            private set { m_ScientificName = value.OrEmptyAndTrim(); }
        }

        private string m_CommonName;
        public virtual string CommonName 
        {
            get { return m_CommonName; }
            private set { m_CommonName = value.OrEmptyAndTrimToTitleCase(); }
        }
    }

    [DebuggerDisplay("{ScientificName} ({CommonName})}")]
    public class Species : KnownSpecies
    {
        protected Species() 
        {}

        public Distance MaxHeight { get; private set; }
        public Distance MaxGirth { get; private set; }
        public Distance MaxCrownSpread { get; private set; }

        public float? CalculateTDI2(Distance height, Distance girth)
        {
            if (!MaxHeight.IsSpecified || !MaxGirth.IsSpecified)
            {
                return null;
            }
            if (!height.IsSpecified || !girth.IsSpecified)
            {
                return null;
            }
            return (float)(((double)MaxHeight.Feet / (double)height.Feet)
                + ((double)MaxGirth.Feet / (double)girth.Feet));
        }

        public float? CalculateTDI3(Distance height, Distance girth, Distance crownSpread)
        {
            if (!MaxHeight.IsSpecified || !MaxGirth.IsSpecified || !MaxCrownSpread.IsSpecified)
            {
                return null;
            }
            if (!height.IsSpecified || !girth.IsSpecified || !crownSpread.IsSpecified)
            {
                return null;
            }
            return (float)(((double)MaxCrownSpread.Feet / (double)height.Feet)
                + ((double)MaxGirth.Feet / (double)girth.Feet)
                + ((double)MaxCrownSpread.Feet / (double)crownSpread.Feet));
        }

        public TDICalculation CalculateTDI(Distance height, Distance girth, Distance crownSpread)
        {
            return new TDICalculation
            {
                TDI2 = CalculateTDI2(height, girth),
                TDI3 = CalculateTDI3(height, girth, crownSpread)
            };
        }
    }

    public class TDICalculation
    {
        protected internal TDICalculation() {}
        public float? TDI2 { get; protected internal set; }
        public float? TDI3 { get; protected internal set; }
    }
}
