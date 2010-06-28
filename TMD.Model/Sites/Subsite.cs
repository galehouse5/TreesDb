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
//    public class Subsite : IEntity
//    {
//        internal Subsite()
//        { }

//        public virtual int Id { get; private set; }
//        public virtual bool IsImported { get; private set; }

//        private string m_Name;
//        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Subsite name must be specified.", Ruleset = "Screening")]
//        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Subsite name must not exceed 100 characters.", Ruleset = "Screening")]
//        public virtual string Name 
//        {
//            get { return m_Name; }
//            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
//        }

//        [ObjectValidator("Screening", Ruleset = "Screening")]
//        [SpecifiedValidator(MessageTemplate = "Subsite coordinates must be specified.")]
//        public virtual Coordinates Coordinates { get; set; }

//        [NotNullValidator(MessageTemplate = "Subsite country must be specified.", Ruleset = "Screening")]
//        public virtual Country Country { get; set; }

//        [NotNullValidator(MessageTemplate = "Subsite state must be specified.", Ruleset = "Screening")]
//        public virtual State State { get; set; }

//        private string m_County;
//        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Subsite county must be specified.", Ruleset = "Screening")]
//        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Site county must not exceed 100 characters.", Ruleset = "Screening")]
//        public virtual string County
//        {
//            get { return m_County; }
//            set { m_County = (value ?? string.Empty).Trim().ToTitleCase(); }
//        }

//        public static Subsite Create()
//        {
//            return new Subsite()
//            {
//                IsImported = false,
//                Name = string.Empty,
//                Coordinates = Coordinates.Null(),
//                County = string.Empty
//            };
//        }
//    }
//}
