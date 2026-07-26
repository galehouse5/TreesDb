// ASP.NET MVC action-parameter model binding from the query string is
// case-INSENSITIVE by key name (`ExportController.SpeciesByFilters(string
// botanicalNameFilter, string commonNameFilter)` bound from
// `Request["BotanicalNameFilter"]`/`Request["CommonNameFilter"]` per
// `TMD/Views/Browse/Species.cshtml:12`'s PascalCase link -- see
// `TMD/Views/Browse/Locations.cshtml:12` for the `LocationsByFilters`
// equivalent). `URLSearchParams.get` is case-sensitive, so this helper
// reproduces the case-insensitive lookup for the two filter endpoints.

export function getSearchParamCI(searchParams: URLSearchParams, name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const key of searchParams.keys()) {
    if (key.toLowerCase() === lower) {
      return searchParams.get(key) ?? undefined;
    }
  }
  return undefined;
}
