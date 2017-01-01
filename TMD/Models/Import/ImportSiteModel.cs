using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using TMD.Extensions;

namespace TMD.Models.Import
{
    public class ImportSiteModel
    {
        public int Id { get; set; }
        public bool IsEditing { get; set; }
        public bool IsSaveableAndRemovable { get; set; }
        public bool HasOptionalError { get; set; }

        [Required]
        public string Name { get; set; }
        [Display(Description = "Latitude, Longitude"), Classification("CoordinatePicker Coordinates")]
        public CoordinatePickerModel Coordinates { get; set; }
        public string Comments { get; set; }

        public IList<ImportSubsiteModel> Subsites { get; set; }

        public ImportSubsiteModel AddSubsite()
        {
            var subsite = new ImportSubsiteModel();
            if (Subsites.Count == 1)
            {
                this.Name = Subsites[0].Name;
                this.Coordinates.Coordinates = Subsites[0].Coordinates.Coordinates;
                this.Comments = Subsites[0].Comments;
            }
            Subsites.Add(subsite);
            return subsite;
        }

        public bool RemoveSubsite(ImportSubsiteModel subsite)
        {
            return Subsites.Remove(subsite);
        }

        public ImportSubsiteModel FindSubsiteById(int id)
        {
            return Subsites.FirstOrDefault(ss => id.Equals(ss.Id));
        }
    }
}