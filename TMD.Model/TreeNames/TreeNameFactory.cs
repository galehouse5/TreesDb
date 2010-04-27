using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;

namespace TMD.Model.TreeNames
{
    public class TreeNameFactory
    {
        internal TreeNameFactory()
        { }

        internal IList<TreeName> CreateFromCsvTreeList(Stream csvTreeList)
        {
            List<TreeName> treeNames = new List<TreeName>();
            char treeNameLineTrimmer = '"';
            string[] treeNameLineSplitter = new string[] { "\",\"" };
            using (StreamReader sr = new StreamReader(csvTreeList))
            {
                while (!sr.EndOfStream)
                {
                    string treeNameLine = sr.ReadLine();
                    if (!string.IsNullOrWhiteSpace(treeNameLine))
                    {
                        string[] treeNameParts = treeNameLine.Trim(treeNameLineTrimmer)
                            .Split(treeNameLineSplitter, StringSplitOptions.None);
                        TreeName tn = TreeName.Create(treeNameParts[0], treeNameParts[2], treeNameParts[3]);
                        treeNames.Add(tn);
                    }
                }
            }
            return treeNames;
        }

    }
}
