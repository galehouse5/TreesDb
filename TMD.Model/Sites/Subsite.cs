using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;
using TMD.Model.Validation;

namespace TMD.Model.Sites
{
    [Serializable]
    public class Subsite : EntityBase, IEntity, IIsValid
    {
        private string m_Name;

        internal Subsite()
        { }

        public string Code { get; private set; }

        [EmptyStringValidator("Site name must be specified.")]
        [StringMaxLengthValidator("Site name must not exceed 100 characters.", 100)]
        public string Name 
        {
            get { return m_Name; }
            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        [IsNullValidator("Site coordinates must be specified.")]
        [IsValidValidator("Site coordinates must be valid.")]
        public Coordinates Coordinates { get; set; }

        public override bool IsValid
        {
            get
            {
                return base.IsValid;
            }
        }

        public bool IsValidIgnoringCoordinates
        {
            get
            {
                return base.isValidExcludingProperties("Coordinates");
            }
        }

        public static Subsite Create()
        {
            Subsite ss = new Subsite();
            ss.Name = string.Empty;
            ss.Coordinates = Coordinates.Null();
            return ss;
        }
    }
}
