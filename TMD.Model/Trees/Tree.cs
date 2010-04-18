using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using TMD.Model.Validation;

namespace TMD.Model.Trees
{
    [Serializable]
    public class Tree : EntityBase, IEntity, IIsValid
    {
        private Tree()
        { }

        public string Code { get; private set; }
        public bool IsDeleted { get; private set; }
        public User Deletor { get; private set; }
        public Date Deleted { get; private set; }
        public Measurement CurrentMeasurement { get; private set; }
        internal IList<Measurement> MeasurementHistory { get; private set; }

        public Measurement TakeNewMeasurement()
        {
            if (CurrentMeasurement.IsValid)
            {
                Measurement m = (Measurement)CurrentMeasurement.Clone();
                m.Code = string.Format("{0:000}", int.Parse(m.Code) + 1);
                MeasurementHistory.Add(CurrentMeasurement);
                CurrentMeasurement = m;
            }
            return CurrentMeasurement;
        }

        public Measurement CorrectCurrentMeasurement()
        {
            if (CurrentMeasurement.IsValid)
            {
                Measurement m = (Measurement)CurrentMeasurement.Clone();
                MeasurementHistory.Add(CurrentMeasurement);
                CurrentMeasurement = m;
            }
            return CurrentMeasurement;
        }

        public void Delete()
        {
            UserSession.User.AssertRole(EUserRoles.DataAdmin);
            IsDeleted = true;
            Deletor = UserSession.User;
            Deleted = Date.Now;
        }

        public Measurer AddMeasurer()
        {
            return CurrentMeasurement.AddMeasurer();
        }

        public bool RemoveMeasurer(Measurer m)
        {
            return CurrentMeasurement.RemoveMeasurer(m);
        }

        public float TDI2
        {
            get
            {
                return (float)((double)CurrentMeasurement.Height.Feet / (double)TreeService.FindTreeOfGreatestHeightBySpecies(CurrentMeasurement.Species).CurrentMeasurement.Height.Feet
                    + (double)CurrentMeasurement.GirthBreastHeight.Feet / (double)TreeService.FindTreeOfGreatestGirthBySpecies(CurrentMeasurement.Species).CurrentMeasurement.Height.Feet);
            }
        }

        public float TDI3
        {
            get
            {
                return (float)((double)CurrentMeasurement.Height.Feet / (double)TreeService.FindTreeOfGreatestHeightBySpecies(CurrentMeasurement.Species).CurrentMeasurement.Height.Feet
                    + (double)CurrentMeasurement.GirthBreastHeight.Feet / (double)TreeService.FindTreeOfGreatestGirthBySpecies(CurrentMeasurement.Species).CurrentMeasurement.Height.Feet
                    + (double)CurrentMeasurement.TDICrownSpread.Feet / (double)TreeService.FindTreeOfGreatestTDICrownSpreadBySpecies(CurrentMeasurement.Species).CurrentMeasurement.Height.Feet);
            }
        }

        public static Tree Create()
        {
            Tree t = new Tree();
            t.IsDeleted = false;
            Measurement m = Measurement.Create();
            m.Code = string.Format("{0:000}", 1);
            t.CurrentMeasurement = m;
            return t;
        }

        public override bool IsValid
        {
            get
            {
                return base.IsValid
                    && CurrentMeasurement.IsValid;
            }
        }

        public override IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            errors.AddRange(base.GetValidationErrors());
            errors.AddRange(CurrentMeasurement.GetValidationErrors());
            return errors;
        }

        public static Distance CalculateRuckerHeightIndex(int species, IEnumerable<Tree> trees)
        {
            Dictionary<string, float> speciesHeights = new Dictionary<string, float>();
            foreach (Tree t in trees)
            {
                if (!t.CurrentMeasurement.Height.IsNull)
                {
                    if (!speciesHeights.ContainsKey(t.CurrentMeasurement.Species))
                    {
                        speciesHeights.Add(t.CurrentMeasurement.Species, t.CurrentMeasurement.Height.Feet);
                    }
                    else
                    {
                        speciesHeights[t.CurrentMeasurement.Species] = Math.Max(speciesHeights[t.CurrentMeasurement.Species], t.CurrentMeasurement.Height.Feet);
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
                if (!t.CurrentMeasurement.Height.IsNull)
                {
                    if (!speciesGirths.ContainsKey(t.CurrentMeasurement.Species))
                    {
                        speciesGirths.Add(t.CurrentMeasurement.Species, t.CurrentMeasurement.GirthBreastHeight.Feet);
                    }
                    else
                    {
                        speciesGirths[t.CurrentMeasurement.Species] = Math.Max(speciesGirths[t.CurrentMeasurement.Species], t.CurrentMeasurement.GirthBreastHeight.Feet);
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
