// Pure display helpers for the History page (task P3-07, doc 05
// §P3-03..07). Port of `TMD/Views/Shared/PrettyTimeSpan.cshtml` -- the
// relative-time label shown next to a DRAFT (not-yet-imported) trip's name
// in `TMD/Views/Import/EditorTemplates/ImportTripSummaryModel.cshtml:21`:
// `@Model.Name (started @Html.Partial("PrettyTimeSpan",
// DateTime.Now.Subtract(Model.Created))) &nbsp;`. No equivalent view helper
// exists elsewhere in this port (grep confirms), so this is a from-scratch
// transcription of the legacy `.cshtml`'s bucket ladder, not a reuse of an
// existing formatter.
//
// The legacy template takes a `TimeSpan` (`Model.TotalDays`, a `double` --
// fractional, NOT floored) and walks a strictly-ascending `< N` ladder; the
// FIRST bucket whose upper bound the value is strictly less than wins. That
// ordering is preserved exactly below, including the asymmetric bucket
// widths (e.g. "this week" spans days 3..&lt;8, but "last week" spans
// 8..&lt;15) -- these are not typos, they are legacy's actual thresholds,
// transcribed verbatim from PrettyTimeSpan.cshtml.

/**
 * `PrettyTimeSpan.cshtml`'s bucket ladder, given `totalDays =
 * (now.getTime() - created.getTime()) / 86_400_000` (a `TimeSpan.TotalDays`
 * equivalent -- fractional, matching the legacy `double`). Negative/NaN
 * input (a `created` timestamp in the future, or a bad date) falls through
 * to "today" -- the same behavior `TotalDays < 1` produces for any
 * `totalDays <= 0`, since the legacy template has no explicit negative-
 * value branch either.
 */
export function formatPrettyTimeSpan(totalDays: number): string {
  if (!(totalDays >= 1)) return "today"; // covers totalDays < 1 AND NaN
  if (totalDays < 2) return "yesterday";
  if (totalDays < 3) return "two days ago";
  if (totalDays < 4) return "three days ago";
  if (totalDays < 8) return "this week";
  if (totalDays < 15) return "last week";
  if (totalDays < 22) return "two weeks ago";
  if (totalDays < 31) return "this month";
  if (totalDays < 61) return "last month";
  if (totalDays < 91) return "two months ago";
  if (totalDays < 121) return "three months ago";
  if (totalDays < 151) return "four months ago";
  if (totalDays < 181) return "five months ago";
  if (totalDays < 221) return "six months ago";
  if (totalDays < 366) return "this year";
  if (totalDays < 731) return "last year";
  if (totalDays < 1096) return "two years ago";
  if (totalDays < 1461) return "three years ago";
  if (totalDays < 1826) return "four years ago";
  if (totalDays < 2191) return "five years ago";
  if (totalDays < 2556) return "six years ago";
  return "over six years ago";
}

/** `DateTime.Now.Subtract(Model.Created)` -- millisecond difference converted to fractional days, then run through the ladder above. */
export function describeTripStarted(created: Date, now: Date): string {
  const totalDays = (now.getTime() - created.getTime()) / 86_400_000;
  return formatPrettyTimeSpan(totalDays);
}
