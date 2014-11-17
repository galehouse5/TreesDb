using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.Entities;
using TMD.Model.Locations;
using TMD.Model.Photo;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public class ExcelImportDatabase
    {
        protected ExcelImportDatabase()
        { }

        public IEnumerable<ExcelImportEntity> Entities { get; private set; }
        public User User { get; private set; }

        public IEnumerable<ExcelImportSite> Sites
        {
            get { return Entities.OfType<ExcelImportSite>(); }
        }

        public IEnumerable<ExcelImportSubsite> Subsites
        {
            get { return Entities.OfType<ExcelImportSubsite>(); }
        }

        public IEnumerable<ExcelImportTree> Trees
        {
            get { return Entities.OfType<ExcelImportTree>(); }
        }

        public IEnumerable<ExcelImportTrunk> Trunks
        {
            get { return Entities.OfType<ExcelImportTrunk>(); }
        }

        public IEnumerable<ExcelImportPhoto> Photos
        {
            get { return Entities.OfType<ExcelImportPhoto>(); }
        }

        public IEnumerable<KeyValuePair<ExcelImportValue, string>> GetErrors()
        {
            return Entities.SelectMany(e => e.GetErrors(Entities));
        }

        public void ShowErrors(IEnumerable<KeyValuePair<ExcelImportValue, string>> errors, IExcelWorkbook workbook)
        {
            foreach (var entityTypeErrors in errors.GroupBy(e => e.Key.Entity.EntityType))
            {
                entityTypeErrors.Key.ShowErrors(entityTypeErrors, workbook);
            }
        }

        public void HideErrors(IExcelWorkbook workbook)
        {
            foreach (ExcelImportEntityType entityType in Entities.Select(e => e.EntityType).Distinct())
            {
                entityType.HideErrors(Entities.Where(e => e.EntityType.Equals(entityType)), workbook);
            }
        }

        public void Fill(IExcelWorkbook workbook)
        {
            foreach (ExcelImportEntityType entityType in Entities.Select(e => e.EntityType).Distinct())
            {
                entityType.Fill(Entities.Where(e => e.EntityType.Equals(entityType)), workbook);
            }
        }

        protected IEnumerable<Tree> CreateTrees(string subsiteName, IEnumerable<PhotoFile> photoFiles)
        {
            foreach (ExcelImportTree importTree in Trees.Where(t => t.SubsiteName.Equals(subsiteName, StringComparison.OrdinalIgnoreCase)))
            {
                Tree tree = new Tree();

                tree.AddMeasurement(importTree.CreateMeasurement(Entities, photoFiles));
                tree.RecalculateProperties();

                yield return tree;
            }
        }

        protected IEnumerable<Subsite> CreateSubsites(string siteName, IEnumerable<State> states, IEnumerable<PhotoFile> photoFiles)
        {
            foreach (string subsiteName in Subsites.Where(ss => siteName.Equals(ss.SiteName, StringComparison.OrdinalIgnoreCase)).Select(ss => ss.SubsiteName.ToLower()).Distinct())
            {
                ExcelImportSubsite importSubsite = Subsites.Last(ss => subsiteName.Equals(ss.SubsiteName, StringComparison.OrdinalIgnoreCase));

                Subsite subsite = new Subsite
                {
                    Name = importSubsite.SubsiteName,
                    State = states.Single(s => s.IsMatch(importSubsite.State.ToString())),
                    County = importSubsite.County
                };

                foreach (SubsiteVisit visit in importSubsite.CreateSubsiteVisits(Entities, states, photoFiles))
                {
                    subsite.AddVisit(visit);
                }

                foreach (Tree tree in CreateTrees(subsiteName, photoFiles))
                {
                    if (subsite.Trees.Any(t => t.ShouldMerge(tree)))
                    {
                        subsite.Trees.First(t => t.ShouldMerge(tree)).Merge(tree);
                    }
                    else
                    {
                        subsite.AddTree(tree);
                    }
                }

                subsite.RecalculateProperties();

                yield return subsite;
            }
        }

        protected IEnumerable<PhotoFile> GetPhotoFiles(PhotoRepository photoRepository)
        {
            var filenames = Photos.Select(p => p.Filename).ToArray();

            return photoRepository.GetFiles(User)
                .Where(f => filenames.Contains(f.Filename));
        }

        public IEnumerable<Site> CreateSites(IEnumerable<State> states, PhotoRepository photoRepository)
        {
            var photoFiles = GetPhotoFiles(photoRepository).ToArray();

            foreach (string siteName in Sites.Select(s => s.SiteName.ToLower()).Distinct())
            {
                ExcelImportSite importSite = Sites.Last(s => siteName.Equals(s.SiteName, StringComparison.OrdinalIgnoreCase));
                
                Site site = new Site { Name = importSite.SiteName };

                foreach (SiteVisit visit in importSite.CreateSiteVisits(Entities))
                {
                    site.AddVisit(visit);
                }

                foreach (Subsite subsite in CreateSubsites(siteName, states, photoFiles))
                {
                    site.AddSubsite(subsite);
                }

                site.RecalculateProperties();

                yield return site;
            }
        }

        public static ExcelImportDatabase Create(User user, IExcelWorkbook workbook)
        {
            return new ExcelImportDatabase
            {
                Entities = ExcelImportEntityType.All.SelectMany(t => t.CreateEntities(workbook, user)).ToArray(),
                User = user
            };
        }

        public static ExcelImportDatabase Create(IEnumerable<ExcelImportEntity> entities, User user)
        {
            return new ExcelImportDatabase
            {
                Entities = entities.ToArray(),
                User = user
            };
        }
    }
}
