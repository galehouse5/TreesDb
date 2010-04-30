using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.IO;
using TMD.Common.FuzzyStringMatching;

namespace TMD.Model.TreeNames
{
    public static class TreeNameService
    {
        private static TreeNameFactory m_Tnf = new TreeNameFactory();
        
        private static List<TreeName> m_TreeNames = new List<TreeName>();
        private static List<TreeName> TreeNames
        {
            get
            {
                if (m_TreeNames.Count == 0)
                {
                    using (Stream csvTreeList = Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.Model.TreeNames.treelist.txt"))
                    {
                        m_TreeNames.AddRange(m_Tnf.CreateFromCsvTreeList(csvTreeList));
                    }
                }
                return m_TreeNames;
            }
        }
        

        public static IList<TreeName> FindTreeNamesSimilarToCommonName(string expression, int results)
        {
            TreeNameFuzzySearchByCommonName search = TreeNameFuzzySearchByCommonName.Create(TreeNames);
            List<TreeName> treeNames = new List<TreeName>();
            foreach (FuzzyStringMatch<TreeName> match in search.Search(expression, results))
            {
                treeNames.Add(match);
            }
            return treeNames;
        }
    }
}
