using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;
using TMD.Model.Validation;

namespace TMD.Model.Sites
{
    public class Subsite : EntityBase, IEntity, IIsValid
    {
        private string m_Name;

        internal Subsite()
        {
            Created = DateTime.Now;
        }

        public string Code { get; private set; }

        [EmptyStringValidator("Site name must be specified.")]
        [StringMaxLengthValidator("Site name must not exceed 100 characters.", 100)]
        public string Name 
        {
            get { return m_Name; }
            set { m_Name = value.Trim().ToTitleCase(); }
        }

        [IsNullValidator("Site coordinates must be specified.")]
        [IsValidValidator("Site coordinates must be valid.")]
        public Coordinates Coordinates { get; set; }
    }
}
