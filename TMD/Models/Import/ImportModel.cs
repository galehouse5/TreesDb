using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web;
using TMD.Model.Users;

namespace TMD.Models.Import
{
    public class ImportModel : IValidatableObject
    {
        public int UserID { get; set; }

        [Required(ErrorMessage = "You must choose a file.")]
        public HttpPostedFileBase Database { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".Equals(Database.ContentType))
                yield return new ValidationResult("File must be an XLSX document.", new string[] { "Database" });
        }

        public void Initialize(User user)
        {
            UserID = user.Id;
        }
    }
}