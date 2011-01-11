using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Extensions;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    public class KnownSpecies : IEntity
    {
        protected KnownSpecies() 
        {}

        public virtual int Id { get; private set; }
        public virtual string AcceptedSymbol { get; private set; }
        public virtual string ScientificName { get; private set; }
        public virtual string CommonName { get; private set; }
    }

    [DebuggerDisplay("{ScientificName}")]
    public class MeasuredSpecies : IEntity
    {
        protected MeasuredSpecies() 
        {}

        public virtual int Id { get; private set; }
        public virtual string ScientificName { get; private set; }
        public virtual Distance MaxHeight { get; private set; }
        public virtual Distance MaxGirth { get; private set; }
        public virtual Distance MaxCrownSpread { get; private set; }

        public virtual float? CalculateTDI2(Distance height, Distance girth)
        {
            if (!MaxHeight.IsSpecified || !MaxGirth.IsSpecified)
            {
                return null;
            }
            if (!height.IsSpecified || !girth.IsSpecified)
            {
                return null;
            }
            return (float)(
                ((double)height.Feet / (double)MaxHeight.Feet)
                + ((double)girth.Feet / (double)MaxGirth.Feet)
            );
        }

        public virtual float? CalculateTDI3(Distance height, Distance girth, Distance crownSpread)
        {
            if (!MaxHeight.IsSpecified || !MaxGirth.IsSpecified || !MaxCrownSpread.IsSpecified)
            {
                return null;
            }
            if (!height.IsSpecified || !girth.IsSpecified || !crownSpread.IsSpecified)
            {
                return null;
            }
            return (float)(
                ((double)height.Feet / (double)MaxCrownSpread.Feet)
                + ((double)girth.Feet / (double)MaxGirth.Feet)
                + ((double)crownSpread.Feet / (double)MaxCrownSpread.Feet)
            );
        }
    }
}
