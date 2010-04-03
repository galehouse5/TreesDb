using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public interface IIsConflicting
    {
        bool IsConflicting { get; }
        IList<string> GetConflicts();
    }
}
