using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trips
{
    public interface ITripRepository
    {
        void Save(Trip t);
        Trip FindById(int id);
        void Remove(Trip t);
    }
}
