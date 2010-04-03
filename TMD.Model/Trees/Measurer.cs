using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;

namespace TMD.Model.Trees
{
    public class Measurer : EntityBase, IEntity
    {
        internal Measurer()
        { }

        [EmptyStringValidator("First name must be specified.")]
        [StringMaxLengthValidator("First name must not exceed 100 characters.", 100)]
        public string FirstName { get; set; }

        [EmptyStringValidator("Last name must be specified.")]
        [StringMaxLengthValidator("Last name must not exceed 100 characters.", 100)]
        public string LastName { get; set; }        
    }
}
