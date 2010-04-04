using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;
using TMD.Model.Validation;

namespace TMD.Model.Sites
{
    [Serializable]
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

        [EmptyStringValidator("Site name must be specified.")]
        [StringMaxLengthValidator("Site name must not exceed 100 characters.", 100)]
        public string Name
        {
            get { return m_Name; }
            set { m_Name = value.Trim().ToTitleCase(); }
        }

        [IsNullValidator("Site country must be specified.")]
        [IsValidValidator("Site country must be valid.")]
        public Country Country { get; set; }

        [IsNullValidator("Site state must be specified.")]
        [IsValidValidator("Site state must be valid.")]
        public State State { get; set; }

        [EmptyStringValidator("Site county must be specified.")]
        [StringMaxLengthValidator("Site county must not exceed 100 characters,", 100)]
        public string County
        {
            get { return m_County; }
            set { m_County = value.Trim().ToTitleCase(); }
        }

        [IsNullValidator("Site coordinates must be specified.")]
        [IsValidValidator("Site coordinates must be valid.")]
        public Coordinates Coordinates { get; set; }

        internal IList<Subsite> Subsites { get; private set; }

        public Subsite AddSubsite()
        {
            Subsite subsite = new Subsite();
            Subsites.Add(subsite);
            return subsite;
        }

        public bool RemoveSubsite(Subsite subsite)
        {
            return Subsites.Remove(subsite);
        }

        public static Site Create()
        {
            return new Site();
        }
    }
}
