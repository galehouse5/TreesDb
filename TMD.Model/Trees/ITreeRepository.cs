﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public interface ITreeRepository
    {
        void Save(Tree tree);
        Tree FindById(int id);
        IList<Tree> ListAll();
        IList<Tree> ListByNameAndSiteId(string botanicalName, string commonName, int siteId);
        void RemoveMeasurementsByTrip(Imports.Trip trip);
        IList<Tree> ListByState(int stateId);
        IList<Tree> ListByName(string botanicalName, string commonName);
        IList<Tree> ListByNameFilters(string botanicalName, string commonName);
        IList<Tree> ListByStateSiteAndSubsiteFilters(string state, string site, string subsite);

        IList<KnownSpecies> ListKnownSpeciesBySimilarCommonName(string commonName, int results);
        IList<KnownSpecies> ListKnownSpeciesBySimilarScientificName(string scientificName, int results);

        EntityPage<T> ListAllMeasuredSpecies<T>(SpeciesBrowser browser) where T : MeasuredSpecies;
        GlobalMeasuredSpecies FindMeasuredSpeciesByName(string botanicalName, string commonName);
        StateMeasuredSpecies FindMeasuredSpeciesByNameAndStateId(string botanicalName, string commonName, int stateId);
        SiteMeasuredSpecies FindMeasuredSpeciesByNameAndSiteId(string botanicalName, string commonName, int siteId);
        SubsiteMeasuredSpecies FindMeasuredSpeciesByNameAndSubsiteId(string botanicalName, string commonName, int subsiteId);
        IList<StateMeasuredSpecies> ListMeasuredSpeciesForStatesByName(string botanicalName, string commonName);
        IList<SiteMeasuredSpecies> ListMeasuredSpeciesForSitesByNameAndStateId(string botanicalName, string commonName, int stateId);
        IList<SubsiteMeasuredSpecies> ListMeasuredSpeciesBySubsiteId(int id);
        IList<StateMeasuredSpecies> ListMeasuredSpeciesByStateId(int id);
    }

    public class SpeciesBrowser : IPagingOptions
    {
        public enum Property { BotanicalName, CommonName }
        public Property? SortProperty { get; set; }
        public bool SortAscending { get; set; }
        public string BotanicalNameFilter { get; set; }
        public string CommonNameFilter { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}
