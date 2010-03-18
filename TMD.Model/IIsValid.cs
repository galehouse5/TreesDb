using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public interface IIsValid
    {
        bool IsValid { get; }
        IList<string> GetValidationErrors();
    }
}
