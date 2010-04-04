using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;

namespace TMD.Model.Validation
{
    [Serializable]
    public class PropertyAttributeValidator : IIsValid
    {
        public virtual bool IsValid
        {
            get 
            {
                foreach (PropertyInfo pi in GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
                {
                    foreach (ValidatorBaseAttribute vba in pi.GetCustomAttributes(typeof(ValidatorBaseAttribute), true))
                    {
                        if (!vba.IsValid(pi.GetValue(this, null)))
                        {
                            return false;
                        }
                    }
                }
                return true;
            }
        }

        public virtual IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();

            foreach (PropertyInfo pi in GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
            {
                foreach (ValidatorBaseAttribute vba in pi.GetCustomAttributes(typeof(ValidatorBaseAttribute), true))
                {
                    if (!vba.IsValid(pi.GetValue(this, null)))
                    {
                        errors.Add(vba.ValidationError);
                    }
                }
            }
            return errors;
        }
    }
}
