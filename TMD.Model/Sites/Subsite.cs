using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;

namespace TMD.Model.Sites
{
    public class Subsite : EntityBase, IEntity, IIsValid
    {
        private string m_Name;

        private Subsite()
        { }

        internal Subsite(Site site)
        {
            Created = DateTime.Now;
            this.Site = site;
        }

        public Site Site { get; private set; }
        public string Code { get; private set; }
        public string Name 
        {
            get { return m_Name; }
            set { m_Name = value.Trim().ToTitleCase(); }
        }
        public Coordinates Coordinates { get; set; }

        #region IIsValid Members

        public bool IsValid
        {
            get 
            { 
                return !string.IsNullOrWhiteSpace(Name) 
                    && !Coordinates.IsNull 
                    && Coordinates.IsValid; 
            }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (string.IsNullOrWhiteSpace(Name))
            {
                errors.Add("Subsite name must be specified.");
            }
            if (Coordinates.IsNull)
            {
                errors.Add("Subsite coordinates must be specified.");
            }
            if (!Coordinates.IsValid)
            {
                errors.Add("Subsite coordinates must be valid.");
            }
            return errors;
        }

        #endregion
    }
}
