using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;

namespace TMD.Model.Validation
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = true)]
    public class Within2Attribute : EmbeddedRuleArgsAttribute, IRuleArgs, IValidator
    {
        public Within2Attribute()
            : this(double.MinValue, double.MaxValue)
        { }

        public Within2Attribute(double min, double max)
            : this(min, max, "{validator.within}")
        { }

        public Within2Attribute(double min, double max, string message)
        {
            Min = min;
            Max = max;
            Message = message;
            Inclusive = false;
        }

        public double Max { get; set; }
        public string Message { get; set; }
        public double Min { get; set; }
        public bool Inclusive { get; set; }

        public bool IsValid(object value, IConstraintValidatorContext constraintValidatorContext)
        {
            if (value == null)
            {
                return true;
            }
            try
            {
                double num = Convert.ToDouble(value);
                if (Inclusive)
                {
                    return ((num >= this.Min) && (num <= this.Max));
                }
                return ((num > this.Min) && (num < this.Max));
            }
            catch (InvalidCastException)
            {
                if (value is char)
                {
                    int num = Convert.ToInt32(value);
                    if (Inclusive)
                    {
                        return ((num >= this.Min) && (num <= this.Max));
                    }
                    return ((num > this.Min) && (num < this.Max));
                }
                return false;
            }
            catch (FormatException)
            {
                return false;
            }
            catch (OverflowException)
            {
                return false;
            }
        }
    }
}
