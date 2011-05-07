using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.UnitTests.Stubs
{
    public class StateStub : State
    {
        public StateStub(string name)
        {
            this.Name = name;
        }
    }
}
