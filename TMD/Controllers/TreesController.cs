using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Imports;
using TMD.Models;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Trees;
using TMD.Model.Extensions;
using AutoMapper;
using System.Diagnostics;
using TMD.Binders;

namespace TMD.Controllers
{
    public partial class TreesController : ControllerBase
    {
        public virtual ActionResult FindKnownSpeciesWithSimilarCommonName(string term, int results = 5)
        {
            var trees = Repositories.Trees.ListKnownSpeciesBySimilarCommonName(term, results);
            return Json(from tree in trees
                        select new 
                        {
                            label = string.Format("{0} ({1})", tree.CommonName, tree.ScientificName),
                            value = tree.CommonName,
                            ScientificName = tree.ScientificName 
                        },
                        JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult FindKnownSpeciesWithSimilarScientificName(string term, int results = 5)
        {
            var trees = Repositories.Trees.ListKnownSpeciesBySimilarScientificName(term, results);
            return Json(from tree in trees
                        select new
                        {
                            value = tree.ScientificName,
                            CommonName = tree.CommonName
                        },
                        JsonRequestBehavior.AllowGet);
        }
    }
}
