using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;

namespace TMD.Model.Sites
{
    public class Site : EntityBase, IEntity
    {
        private string m_Name;
        private string m_County;

        private Site()
        {
            this.Country = Country.Null();
            this.State = State.Null();
            this.Coordinates = Coordinates.Null();
            this.Subsites = new List<Subsite>();
        }

        public string Code { get; private set; }
        public string Name
        {
            get { return m_Name; }
            set { m_Name = value.Trim().ToTitleCase(); }
        }
        public Country Country { get; set; }
        public State State { get; set; }
        public string County
        {
            get { return m_County; }
            set { m_County = value.Trim().ToTitleCase(); }
        }
        public Coordinates Coordinates { get; set; }
        internal IList<Subsite> Subsites { get; private set; }

        public Subsite AddSubsite()
        {
            Subsite subsite = new Subsite(this);
            Subsites.Add(subsite);
            return subsite;
        }

        public bool RemoveSubsite(Subsite subsite)
        {
            return Subsites.Remove(subsite);
        }

        #region IIsValid Members

        public bool IsValid
        {
            get 
            {
                return !string.IsNullOrWhiteSpace(Name)
                    && !Coordinates.IsNull
                    && Coordinates.IsValid
                    && !Country.IsNull
                    && Country.IsValid
                    && !State.IsNull
                    && State.IsValid;
            }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (string.IsNullOrWhiteSpace(Name))
            {
                errors.Add("Site name must be specified.");
            }
            if (Coordinates.IsNull)
            {
                errors.Add("Site coordinates must be specified.");
            }
            if (!Coordinates.IsValid)
            {
                errors.Add("Site coordinates must be valid.");
            }
            if (Country.IsNull)
            {
                errors.Add("Site country must be specified.");
            }
            if (!Country.IsValid)
            {
                errors.Add("Site country must be valid.");
            }
            if (State.IsNull)
            {
                errors.Add("Site state must be specified.");
            }
            if (!State.IsValid)
            {
                errors.Add("Site state must be valid.");
            }
            return errors;
        }

        #endregion

        public static Site Create()
        {
            return new Site();
        }
    }
}
