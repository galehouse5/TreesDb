using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.Models
{
    public abstract class PhotoCaptionModel
    {
        public string Caption { get; set; }
        [UIHint("ConcatenatedNames")]
        public IList<string> Photographers { get; set; }
        public abstract string ContextFormat { get; }
        public abstract IList<string> ContextArguments { get; }
        public abstract IList<string> ContextArgumentActionNames { get; }
        public abstract IList<object> ContextArgumentRouteValues { get; }
    }

    public class TreePhotoCaptionModel : PhotoCaptionModel
    {
        public int TreeId { get; set; }
        public string BotanicalName { get; set; }
        public int SiteId { get; set; }
        public string SiteName { get; set; }
        public State State { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }

        public override string ContextFormat
        {
            get { return "{0} of {1} in {2}"; }
        }

        public override IList<string> ContextArguments
        {
            get { return new List<string> { BotanicalName, SiteName, StateName }; }
        }

        public override IList<string> ContextArgumentActionNames
        {
            get { return new List<string> { "TreeDetails", "SiteDetails", "StateDetails" }; }
        }

        public override IList<object> ContextArgumentRouteValues
        {
            get { return new List<object> { new { id = TreeId, controller = "Browse" }, new { id = SiteId, controller = "Browse" }, new { id = StateId, controller = "Browse" } }; }
        }
    }

    public class SubsitePhotoCaptionModel : PhotoCaptionModel
    {
        public int SiteId { get; set; }
        public string SiteName { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }

        public override string ContextFormat
        {
            get { return "{0} in {1}"; }
        }

        public override IList<string> ContextArguments
        {
            get { return new List<string> { SiteName, StateName }; }
        }

        public override IList<string> ContextArgumentActionNames
        {
            get { return new List<string> { "SiteDetails", "StateDetails" }; }
        }

        public override IList<object> ContextArgumentRouteValues
        {
            get { return new List<object> { new { id = SiteId, controller = "Browse" }, new { id = StateId, controller = "Browse" } }; }
        }
    }

    public class EmptyContextPhotoCaptionModel : PhotoCaptionModel
    {
        public override string ContextFormat
        {
            get { return string.Empty; }
        }

        public override IList<string> ContextArguments
        {
            get { return new List<string>(); }
        }

        public override IList<string> ContextArgumentActionNames
        {
            get { return new List<string>(); }
        }

        public override IList<object> ContextArgumentRouteValues
        {
            get { return new List<object>(); }
        }
    }
}