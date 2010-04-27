using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.TreeNames
{
    [Serializable]
    public class TreeName
    {
        private TreeName()
        { }

        public string AcceptedSymbol { get; private set; }
        public string ScientificName { get; private set; }
        public string CommonName { get; private set; }

        internal static TreeName Create(string acceptedSymbol, string scientificName, string commonName)
        {
            TreeName tn = new TreeName();
            tn.AcceptedSymbol = acceptedSymbol;
            tn.ScientificName = scientificName;
            tn.CommonName = commonName;
            return tn;
        }
    }
}
