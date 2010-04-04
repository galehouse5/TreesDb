using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trips;

namespace TMD.QuickTest
{
    class Program
    {
        static void Main(string[] args)
        {
            Trip t = Trip.Create();
            t.Website = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
            bool valid = t.IsValid;
            IList<string> errors = t.GetValidationErrors();
        }
    }
}
