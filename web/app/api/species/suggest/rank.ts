/**
 * Port of `TreeRepository.ListKnownSpeciesBySimilarCommonName` /
 * `ListKnownSpeciesBySimilarScientificName`
 * (`TMD.Infrastructure/Repositories/TreeRepository.cs:49-88`), the ranking
 * behind `TreesController.FindKnownSpeciesWithSimilar{Common,Scientific}Name`
 * (task P1-09, doc 01 §1).
 *
 * IMPORTANT: despite doc 03's task-note phrasing ("LIKE predicates ...
 * transcribe"), this is NOT a `LIKE`-based query. Legacy loads the entire
 * `Trees.KnownSpecies` table (~1800 rows in production, cheap) and ranks
 * every row in memory via `TMD.Infrastructure/StringComparison/*` -- a small
 * hand-rolled expression language (`StringComparisonExpression.Create`)
 * evaluating compiled `SimMetricsMetricUtilities` string-similarity metrics
 * (`TMD.Infrastructure/Repositories/TreeRepository.cs:45-47`):
 *
 *   m_AcceptedSymbolRanker    = "equality * 100"
 *   m_CommonNameRanker        = "jaro * firstlength"
 *   m_ScientificNameRanker    = "jarowinkler * firstlength"
 *
 * ListKnownSpeciesBySimilarCommonName(term):
 *   rank = RateWordSimilarity(term, AcceptedSymbol)                    [equality*100 -> 0 or 100]
 *        + RateSentenceSimilarity(term, CommonName)     * 4            [jaro * firstlength, summed per matched word pair]
 *        + RateSentenceSimilarity(term, ScientificName)                [jarowinkler * firstlength]
 *   filter: rank >= CommonName.Length ; order by rank desc ; take(results)
 *
 * ListKnownSpeciesBySimilarScientificName(term): same shape, weights on
 * CommonName/ScientificName swapped (x1 / x4) -- see TreeRepository.cs:68-88.
 * Both variants filter on `CommonName.Length` (not a per-search-mode
 * threshold) -- read directly from TreeRepository.cs, not a typo.
 *
 * Jaro / Jaro-Winkler are implemented here from scratch (no
 * `SimMetricsMetricUtilities` port exists in .NET-free form) by
 * disassembling `ThirdPartyAssemblies/SimMetrics/SimMetrics.dll` with
 * `ildasm` and transcribing the IL for `Jaro.GetSimilarity`/
 * `JaroWinkler.GetSimilarity` byte-for-byte (see `jaroSimilarity`/
 * `jaroWinklerSimilarity` below for the resulting formulas -- notably the
 * matching window is `floor(min(len1,len2)/2) + 1`, NOT the textbook
 * `floor(max(len1,len2)/2) - 1` most Jaro writeups use). Verified against
 * the real assembly (loaded via .NET reflection in PowerShell) on 200
 * randomized word-pair vectors plus the classic textbook examples
 * (martha/marhta, dixon/dicksonx, crate/trace) with zero mismatches before
 * this file was written -- the transcription is exact, not an
 * approximation of "a" Jaro-Winkler variant.
 */

// ---------------------------------------------------------------------------
// Jaro / Jaro-Winkler (SimMetricsMetricUtilities.Jaro / .JaroWinkler)
// ---------------------------------------------------------------------------

/**
 * `Jaro.GetCommonCharacters` (IL: for each char of `a`, scan a window of
 * `b` -- positions already consumed by an earlier match are excluded via an
 * in-place sentinel overwrite -- for the first unused equal character,
 * appending it to the result in `a`-index order).
 */
function commonCharacters(a: string, b: string, distanceSep: number): string {
  const copy = b.split("");
  let common = "";
  for (let i = 0; i < a.length; i++) {
    const c = a[i];
    const lower = Math.max(0, i - distanceSep);
    const upper = Math.min(i + distanceSep, b.length);
    for (let j = lower; j < upper; j++) {
      if (copy[j] === c) {
        common += c;
        copy[j] = "\0";
        break;
      }
    }
  }
  return common;
}

/**
 * `Jaro.GetSimilarity`. Matching window = `floor(min(len1,len2)/2) + 1`
 * (integer division) -- transcribed from IL, not the textbook formula (see
 * file header). Transpositions counted by running `GetCommonCharacters`
 * BOTH ways (`a` scanning `b`, then `b` scanning `a`) and comparing the two
 * resulting common-character sequences position-by-position; the raw
 * mismatch count is halved via INTEGER division (matches IL `div`, not a
 * float halving).
 */
export function jaroSimilarity(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;
  const distanceSep = Math.floor(Math.min(len1, len2) / 2) + 1;
  const common1 = commonCharacters(s1, s2, distanceSep);
  const m = common1.length;
  if (m === 0) return 0;
  const common2 = commonCharacters(s2, s1, distanceSep);
  if (m !== common2.length) return 0;
  let mismatches = 0;
  for (let k = 0; k < m; k++) {
    if (common1[k] !== common2[k]) mismatches++;
  }
  const transpositions = Math.floor(mismatches / 2);
  return m / (3 * len1) + m / (3 * len2) + (m - transpositions) / (3 * m);
}

/** `JaroWinkler.GetPrefixLength`: common prefix length, capped at `min(4, len1, len2)`. */
function commonPrefixLength(s1: string, s2: string): number {
  const bound = Math.min(4, s1.length, s2.length);
  let k = 0;
  while (k < bound && s1[k] === s2[k]) k++;
  return k;
}

/**
 * `JaroWinkler.GetSimilarity`: `jaro + prefixLen * 0.1 * (1 - jaro)`,
 * applied UNCONDITIONALLY (no minimum-jaro threshold gate in the IL, unlike
 * some textbook Jaro-Winkler descriptions).
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1.length === 0 || s2.length === 0) return 0;
  const jaro = jaroSimilarity(s1, s2);
  const prefixLen = commonPrefixLength(s1, s2);
  return jaro + prefixLen * 0.1 * (1 - jaro);
}

// ---------------------------------------------------------------------------
// StringComparisonService (RateWordSimilarity / RateSentenceSimilarity)
// ---------------------------------------------------------------------------

function isBlank(s: string): boolean {
  return s.trim().length === 0;
}

/**
 * `StringComparison.RateWordSimilarity` specialized to the ONLY expression
 * this port needs (`m_AcceptedSymbolRanker = "equality * 100"`): trims +
 * lowercases both words, then exact-equality * 100 (0 or 100). Blank input
 * (either side) -> 0, per `IsNullOrWhiteSpace` in the source.
 */
function rateAcceptedSymbolSimilarity(term: string, acceptedSymbol: string): number {
  if (isBlank(term) || isBlank(acceptedSymbol)) return 0;
  return term.trim().toLowerCase() === acceptedSymbol.trim().toLowerCase() ? 100 : 0;
}

const SENTENCE_SEPARATORS = /[ .,\-!?]+/;

/** `StringComparison.RateSentenceSimilarity`'s word split: trim+lower, split on `[" ",".",",","-","!","?"]`, drop empty entries. */
function normalizeSentenceWords(sentence: string): string[] {
  return sentence
    .trim()
    .toLowerCase()
    .split(SENTENCE_SEPARATORS)
    .filter((w) => w.length > 0);
}

/**
 * `StringComparison.RateSentenceSimilarity`: pairwise-rank every
 * (firstWord, secondWord) combination via `wordSimilarity` (which, for both
 * expressions used here, is `metric(firstWord, secondWord) * firstWord.length`
 * -- "firstlength" in the legacy expression language means the length of
 * the FIRST sentence's word), then greedily assign matches highest-rank
 * first, each word usable at most once on either side, stopping once
 * `min(firstWords.length, secondWords.length)` pairs have been assigned.
 * Sum of assigned pair ranks is the sentence rank.
 *
 * Tie-break note: legacy sorts candidate pairs with .NET `List<T>.Sort`
 * (an unstable introspective sort) before the greedy assignment, so tied
 * ranks can select a different pairing than this port's stable sort +
 * (firstIndex asc, secondIndex asc) tie-break -- this only matters when two
 * DISTINCT word pairs tie exactly AND the choice between them changes which
 * later pairs remain available (the sum itself is unaffected by which
 * zero/tied-value pair is picked when index availability doesn't change).
 * Documented as a residual, unproven-in-general approximation, same class
 * of gap as `browse-grids.sql.ts`'s tiebreak waivers.
 */
function rateSentenceSimilarity(metric: (a: string, b: string) => number, firstSentence: string, secondSentence: string): number {
  if (isBlank(firstSentence) || isBlank(secondSentence)) return 0;
  const firstWords = normalizeSentenceWords(firstSentence);
  const secondWords = normalizeSentenceWords(secondSentence);

  const pairs: { i: number; j: number; rank: number }[] = [];
  for (let i = 0; i < firstWords.length; i++) {
    for (let j = 0; j < secondWords.length; j++) {
      const rank = metric(firstWords[i]!, secondWords[j]!) * firstWords[i]!.length;
      pairs.push({ i, j, rank });
    }
  }
  pairs.sort((a, b) => b.rank - a.rank || a.i - b.i || a.j - b.j);

  const usedFirst = new Set<number>();
  const usedSecond = new Set<number>();
  const target = Math.min(firstWords.length, secondWords.length);
  let total = 0;
  let assigned = 0;
  for (const pair of pairs) {
    if (assigned >= target) break;
    if (usedFirst.has(pair.i) || usedSecond.has(pair.j)) continue;
    total += pair.rank;
    usedFirst.add(pair.i);
    usedSecond.add(pair.j);
    assigned++;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Ranking over Trees.KnownSpecies
// ---------------------------------------------------------------------------

export interface KnownSpeciesCandidate {
  acceptedSymbol: string;
  scientificName: string;
  commonName: string;
}

function rankCandidate(
  term: string,
  candidate: KnownSpeciesCandidate,
  commonNameWeight: number,
  scientificNameWeight: number,
): number {
  return (
    rateAcceptedSymbolSimilarity(term, candidate.acceptedSymbol) +
    rateSentenceSimilarity(jaroSimilarity, term, candidate.commonName) * commonNameWeight +
    rateSentenceSimilarity(jaroWinklerSimilarity, term, candidate.scientificName) * scientificNameWeight
  );
}

function rankAndFilter(
  term: string,
  candidates: readonly KnownSpeciesCandidate[],
  results: number,
  commonNameWeight: number,
  scientificNameWeight: number,
): KnownSpeciesCandidate[] {
  const ranked = candidates
    .map((candidate, index) => ({
      candidate,
      index,
      rank: rankCandidate(term, candidate, commonNameWeight, scientificNameWeight),
    }))
    // TreeRepository.cs:60/80: `where tree.Rank >= tree.Tree.CommonName.Length`
    // -- each candidate's OWN CommonName length, both search modes.
    .filter((r) => r.rank >= r.candidate.commonName.length);
  ranked.sort((a, b) => b.rank - a.rank || a.index - b.index);
  return ranked.slice(0, results).map((r) => r.candidate);
}

/** Port of `TreeRepository.ListKnownSpeciesBySimilarCommonName` (weights: AcceptedSymbol x1, CommonName x4, ScientificName x1). */
export function rankKnownSpeciesBySimilarCommonName(
  term: string,
  candidates: readonly KnownSpeciesCandidate[],
  results: number,
): KnownSpeciesCandidate[] {
  return rankAndFilter(term, candidates, results, 4, 1);
}

/** Port of `TreeRepository.ListKnownSpeciesBySimilarScientificName` (weights: AcceptedSymbol x1, CommonName x1, ScientificName x4). */
export function rankKnownSpeciesBySimilarScientificName(
  term: string,
  candidates: readonly KnownSpeciesCandidate[],
  results: number,
): KnownSpeciesCandidate[] {
  return rankAndFilter(term, candidates, results, 1, 4);
}
