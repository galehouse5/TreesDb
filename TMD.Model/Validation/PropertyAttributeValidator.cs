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

        protected virtual bool isValidExcludingProperties(params string[] propertyNames)
        {
            foreach (PropertyInfo pi in GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
            {
                if (!propertyNames.Contains(pi.Name))
                {
                    foreach (ValidatorBaseAttribute vba in pi.GetCustomAttributes(typeof(ValidatorBaseAttribute), true))
                    {
                        if (!vba.IsValid(pi.GetValue(this, null)))
                        {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        public virtual IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();

            foreach (PropertyInfo pi in GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
            {
                foreach (ValidatorBaseAttribute vba in pi.GetCustomAttributes(typeof(ValidatorBaseAttribute), true))
                {
                    if (!vba.IsValid(pi.GetValue(this, null)))
                    {
                        errors.Add(ValidationError.Create(this, pi.Name, vba.ValidationError));
                    }
                }
            }
            return errors;
        }
    }
}
