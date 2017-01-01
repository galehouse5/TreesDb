using TMD.Model.Validation;

namespace TMD.Model.Extensions
{
    public static class ISpecifiedExtensions
    {
        public static bool IsValidAndSpecified(this object source, params ValidationTag[] tags)
        {
            if (!source.IsValid(tags)) return false;

            ISpecified specified = source as ISpecified;
            return specified?.IsSpecified ?? false;
        }

        public static bool IsValidAndSpecified(this object source)
            => source.IsValidAndSpecified(ValidationTag.Required);
    }
}
