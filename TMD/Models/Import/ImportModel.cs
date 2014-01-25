using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web;

namespace TMD.Models.Import
{
    public class ImportModel : IValidatableObject
    {
        [Required(ErrorMessage = "You must choose a file.")]
        public HttpPostedFileBase Database { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".Equals(Database.ContentType))
                yield return new ValidationResult("You must choose an XLSX file.", new string[] { "Database" });
        }
    }
}