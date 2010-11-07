﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;

namespace TMD.Model.Extensions
{
    public static class ISpecifiedExtensions
    {
        public static bool IsValidAndSpecified(this object source, params Tag[] tags)
        {
            if (source.IsValid(tags))
            {
                ISpecified specified = source as ISpecified;
                if (specified != null)
                {
                    return specified.IsSpecified;
                }
                return false;
            }
            return false;
        }

        public static bool IsValidAndSpecified(this object source)
        {
            return source.IsValidAndSpecified(Tag.Screening, Tag.Persistence, Tag.Finalization, Tag.Optional);
        }
    }
}
