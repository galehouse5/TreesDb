using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SimMetricsApi;
using SimMetricsMetricUtilities;
using TMD.Infrastructure.StringComparison.SimilarityMetrics;

namespace TMD.Infrastructure.StringComparison
{
    internal class SimilarityMetricFactory
    {
        private readonly Dictionary<string, IStringMetric> m_StringMetrics;

        public SimilarityMetricFactory()
        {
            m_StringMetrics = new Dictionary<string, IStringMetric>(21);
            m_StringMetrics.Add("levenstein", new Levenstein());
            m_StringMetrics.Add("needlemanwunch", new NeedlemanWunch());
            m_StringMetrics.Add("smithwaterman", new SmithWaterman());
            m_StringMetrics.Add("smithwatermangotoh", new SmithWatermanGotoh());
            m_StringMetrics.Add("smithwatermangotohwindowedaffine", new SmithWatermanGotohWindowedAffine());
            m_StringMetrics.Add("jaro", new Jaro());
            m_StringMetrics.Add("jarowinkler", new JaroWinkler());
            m_StringMetrics.Add("chapmanlengthdeviation", new ChapmanLengthDeviation());
            m_StringMetrics.Add("chapmanmeanlength", new ChapmanMeanLength());
            m_StringMetrics.Add("qgramsdistance", new QGramsDistance());
            m_StringMetrics.Add("blockdistance", new BlockDistance());
            m_StringMetrics.Add("cosinesimilarity", new CosineSimilarity());
            m_StringMetrics.Add("dicesimilarity", new DiceSimilarity());
            m_StringMetrics.Add("euclideandistance", new EuclideanDistance());
            m_StringMetrics.Add("jaccardsimilarity", new JaccardSimilarity());
            m_StringMetrics.Add("matchingcoefficient", new MatchingCoefficient());
            m_StringMetrics.Add("mongeelkan", new MongeElkan());
            m_StringMetrics.Add("overlapcoefficient", new OverlapCoefficient());
            m_StringMetrics.Add("equality", new Equality());
            m_StringMetrics.Add("firstcontains", new FirstContains());
            m_StringMetrics.Add("secondcontains", new SecondContains());
        }

        public IStringMetric Create(string name)
        {
            return m_StringMetrics[name];
        }
    }
}
