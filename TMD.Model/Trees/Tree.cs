using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using TMD.Model.Validation;

namespace TMD.Model.Trees
{
    public class Tree : EntityBase, IEntity, IIsValid
    {
        private Tree()
        { }

        public string Code { get; private set; }
        public string MeasurementCode { get; private set; }
        public Measurement Measurement { get; private set; }

        public Measurer AddMeasurer()
        {
            return Measurement.AddMeasurer();
        }

        public bool RemoveMeasurer(Measurer m)
        {
            return Measurement.RemoveMeasurer(m);
        }

        public static Tree Create()
        {
            Tree t = new Tree();
            t.MeasurementCode = "001";
            t.Measurement = new Measurement(t.MeasurementCode);
            return t;
        }

        public override bool IsValid
        {
            get
            {
                return base.IsValid
                    && Measurement.IsValid;
            }
        }

        public override IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            errors.AddRange(base.GetValidationErrors());
            errors.AddRange(Measurement.GetValidationErrors());
            return errors;
        }

        public static Distance CalculateRuckerHeightIndex(int species, IEnumerable<Tree> trees)
        {
            Dictionary<string, float> speciesHeights = new Dictionary<string, float>();
            foreach (Tree t in trees)
            {
                if (!t.Measurement.Height.IsNull)
                {
                    if (!speciesHeights.ContainsKey(t.Measurement.Species))
                    {
                        speciesHeights.Add(t.Measurement.Species, t.Measurement.Height.Feet);
                    }
                    else
                    {
                        speciesHeights[t.Measurement.Species] = Math.Max(speciesHeights[t.Measurement.Species], t.Measurement.Height.Feet);
                    }
                }
            }
            if (speciesHeights.Count >= species)
            {
                List<float> sortedHeights = speciesHeights.Values.ToList();
                sortedHeights.Sort();
                double ruckerHeightIndex = 0d;
                for (int i = sortedHeights.Count - 1; i > sortedHeights.Count - 1 - species; i--)
                {
                    ruckerHeightIndex += sortedHeights[i];
                }
                ruckerHeightIndex /= species;
                return Distance.Create((float)ruckerHeightIndex);
            }
            else
            {
                return Distance.Null();
            }
        }

        public static Distance CalculateRuckerGirthIndex(int species, IEnumerable<Tree> trees)
        {
            Dictionary<string, float> speciesGirths = new Dictionary<string, float>();
            foreach (Tree t in trees)
            {
                if (!t.Measurement.Height.IsNull)
                {
                    if (!speciesGirths.ContainsKey(t.Measurement.Species))
                    {
                        speciesGirths.Add(t.Measurement.Species, t.Measurement.GirthBreastHeight.Feet);
                    }
                    else
                    {
                        speciesGirths[t.Measurement.Species] = Math.Max(speciesGirths[t.Measurement.Species], t.Measurement.GirthBreastHeight.Feet);
                    }
                }
            }
            if (speciesGirths.Count >= species)
            {
                List<float> sortedGirths = speciesGirths.Values.ToList();
                sortedGirths.Sort();
                double ruckerGirthIndex = 0d;
                for (int i = sortedGirths.Count - 1; i > sortedGirths.Count - 1 - species; i--)
                {
                    ruckerGirthIndex += sortedGirths[i];
                }
                ruckerGirthIndex /= species;
                return Distance.Create((float)ruckerGirthIndex);
            }
            else
            {
                return Distance.Null();
            }
        }
    }
}
