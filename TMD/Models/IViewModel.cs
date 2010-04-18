using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Models
{
    public interface IViewModel<T>
    {
        T Entity { get; set; }
        void FillModelFromEntity();
        void FillEntityFromModel();
    }
}
