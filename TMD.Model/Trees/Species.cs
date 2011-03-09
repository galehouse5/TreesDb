using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Extensions;
using TMD.Model.Locations;
using TMD.Model.Sites;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("Known {ScientificName}'s")]
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
    public abstract class MeasuredSpecies : IEntity
    {
        protected MeasuredSpecies() 
        {}

        public virtual int Id { get; private set; }
        public virtual string ScientificName { get; private set; }
        public virtual string CommonName { get; private set; }
        public virtual Distance MaxHeight { get; private set; }
        public virtual Tree MaxHeightTree { get; private set; }
        public virtual Distance MaxGirth { get; private set; }
        public virtual Tree MaxGirthTree { get; private set; }
        public virtual Distance MaxCrownSpread { get; private set; }
        public virtual Tree MaxCrownSpreadTree { get; private set; }

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
                ((double)height.Feet / (double)MaxHeight.Feet)
                + ((double)girth.Feet / (double)MaxGirth.Feet)
                + ((double)crownSpread.Feet / (double)MaxCrownSpread.Feet)
            );
        }
    }

    [DebuggerDisplay("{ScientificName}'s measured globally")]
    public class GlobalMeasuredSpecies : MeasuredSpecies
    {
        protected GlobalMeasuredSpecies()
        { }
    }

    [DebuggerDisplay("{ScientificName}'s measured in state of {State.Name}")]
    public class StateMeasuredSpecies : MeasuredSpecies
    {
        protected StateMeasuredSpecies()
        { }

        public virtual State State { get; private set; }
    }

    [DebuggerDisplay("{ScientificName}'s measured in site of {Site.Name} ({Site.Id})")]
    public class SiteMeasuredSpecies : MeasuredSpecies
    {
        protected SiteMeasuredSpecies()
        { }

        public virtual Site Site { get; private set; }
    }

    [DebuggerDisplay("{ScientificName}'s measured in subsite of {Subsite.Name} ({Subsite.Id})")]
    public class SubsiteMeasuredSpecies : MeasuredSpecies
    {
        protected SubsiteMeasuredSpecies()
        { }

        public virtual Subsite Subsite { get; private set; }
    }
}
