//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using TMD.Model.Validation;
//using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
//using System.Diagnostics;

//namespace TMD.Model.Sites
//{
//    [Serializable]
//    [DebuggerDisplay("{Name}")]
//    public class Site : IEntity
//    {
//        protected Site()
//        { }

//        public virtual int Id { get; private set; }
//        public virtual bool IsImported { get; private set; }

//        private string m_Name;
//        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Site name must be specified.", Ruleset = "Screening")]
//        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Site name must not exceed 100 characters.", Ruleset = "Screening")]
//        public virtual string Name
//        {
//            get { return m_Name; }
//            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
//        }

//        private Coordinates m_Coordinates;
//        [ObjectValidator("Screening", Ruleset = "Screening")]
//        [SpecifiedValidator(MessageTemplate = "Site coordinates must be specified.")]
//        public virtual Coordinates Coordinates
//        {
//            get
//            {
//                if (Subsites.Count > 0)
//                {
//                    List<Coordinates> ssCoords = new List<Coordinates>();
//                    foreach (Subsite ss in Subsites)
//                    {
//                        if (ss.Coordinates.IsSpecified)
//                        {
//                            ssCoords.Add(ss.Coordinates);
//                        }
//                    }
//                    CoordinateBounds cb = CoordinateBounds.Create(ssCoords);
//                    return cb.Center;
//                }
//                return m_Coordinates;
//            }
//            private set { m_Coordinates = value; }
//        }

//        [ObjectCollectionValidator]
//        [ObjectCollectionValidator(TargetRuleset = "Screening", Ruleset = "Screening")]
//        [CollectionCountWhenNotNullValidator(1, int.MaxValue, MessageTemplate = "Site must contain at least one subsite.")]
//        [CollectionCountWhenNotNullValidator(int.MinValue, 100, MessageTemplate = "Site contains too many subsites.")]
//        public virtual IList<Subsite> Subsites { get; private set; }

//        public virtual Subsite AddSubsite()
//        {
//            Subsite subsite = Subsite.Create();
//            Subsites.Add(subsite);
//            return subsite;
//        }

//        public virtual bool RemoveSubsite(Subsite subsite)
//        {
//            return Subsites.Remove(subsite);
//        }

//        public static Site Create()
//        {
//            return new Site()
//            {
//                IsImported = false,
//                Name = string.Empty,
//                Coordinates = Coordinates.Null(),
//                Subsites = new List<Subsite>()
//            };
//        }
//    }
//}
