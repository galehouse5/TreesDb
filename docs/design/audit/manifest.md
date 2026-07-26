# Design audit manifest

Generated 2026-07-19T04:56:51.529Z by `web/scripts/design-audit/capture.ts` against http://localhost:3000.

## Screenshots

| Slug | Viewport | File | URL | Note |
|---|---|---|---|---|
| locations | desktop | `docs/design/audit/locations--desktop.png` | http://localhost:3000/locations |  |
| species | desktop | `docs/design/audit/species--desktop.png` | http://localhost:3000/species |  |
| site-detail | desktop | `docs/design/audit/site-detail--desktop.png` | http://localhost:3000/sites/436 |  |
| site-detail-alt | desktop | `docs/design/audit/site-detail-alt--desktop.png` | http://localhost:3000/sites/41183 | site with the most site_visits rows -- subsites concept no longer exists in schema |
| state-detail | desktop | `docs/design/audit/state-detail--desktop.png` | http://localhost:3000/states/32 |  |
| tree-detail | desktop | `docs/design/audit/tree-detail--desktop.png` | http://localhost:3000/trees/2343 |  |
| species-detail | desktop | `docs/design/audit/species-detail--desktop.png` | http://localhost:3000/species/abies-alba--silver-fir | first species link from /species (href=/species/abies-alba--silver-fir) |
| search | desktop | `docs/design/audit/search--desktop.png` | http://localhost:3000/search?term=oak |  |
| activity | desktop | `docs/design/audit/activity--desktop.png` | http://localhost:3000/activity |  |
| not-found | desktop | `docs/design/audit/not-found--desktop.png` | http://localhost:3000/this-page-does-not-exist |  |
| sign-in | desktop | `docs/design/audit/sign-in--desktop.png` | http://localhost:3000/account/login?callbackUrl=/account | redirect target of /account while signed out |
| register | desktop | `docs/design/audit/register--desktop.png` | http://localhost:3000/account/register |  |
| password-assistance | desktop | `docs/design/audit/password-assistance--desktop.png` | http://localhost:3000/account/password-assistance |  |
| map | desktop | `docs/design/audit/map--desktop.png` | http://localhost:3000/map |  |
| locations | mobile | `docs/design/audit/locations--mobile.png` | http://localhost:3000/locations |  |
| species | mobile | `docs/design/audit/species--mobile.png` | http://localhost:3000/species |  |
| site-detail | mobile | `docs/design/audit/site-detail--mobile.png` | http://localhost:3000/sites/436 |  |
| site-detail-alt | mobile | `docs/design/audit/site-detail-alt--mobile.png` | http://localhost:3000/sites/41183 | site with the most site_visits rows -- subsites concept no longer exists in schema |
| state-detail | mobile | `docs/design/audit/state-detail--mobile.png` | http://localhost:3000/states/32 |  |
| tree-detail | mobile | `docs/design/audit/tree-detail--mobile.png` | http://localhost:3000/trees/2343 |  |
| species-detail | mobile | `docs/design/audit/species-detail--mobile.png` | http://localhost:3000/species/abies-alba--silver-fir | first species link from /species (href=/species/abies-alba--silver-fir) |
| search | mobile | `docs/design/audit/search--mobile.png` | http://localhost:3000/search?term=oak |  |
| activity | mobile | `docs/design/audit/activity--mobile.png` | http://localhost:3000/activity |  |
| not-found | mobile | `docs/design/audit/not-found--mobile.png` | http://localhost:3000/this-page-does-not-exist |  |
| sign-in | mobile | `docs/design/audit/sign-in--mobile.png` | http://localhost:3000/account/login?callbackUrl=/account | redirect target of /account while signed out |
| register | mobile | `docs/design/audit/register--mobile.png` | http://localhost:3000/account/register |  |
| password-assistance | mobile | `docs/design/audit/password-assistance--mobile.png` | http://localhost:3000/account/password-assistance |  |
| map | mobile | `docs/design/audit/map--mobile.png` | http://localhost:3000/map |  |
| account-signed-in | desktop | `docs/design/audit/account-signed-in--desktop.png` | http://localhost:3000/account |  |
| import-home | desktop | `docs/design/audit/import-home--desktop.png` | http://localhost:3000/import |  |
| import-step-1 | desktop | `docs/design/audit/import-step-1--desktop.png` | http://localhost:3000/import/21686/trip | trip step |
| import-step-2 | desktop | `docs/design/audit/import-step-2--desktop.png` | http://localhost:3000/import/21686/sites | sites step (auto-created blank site, in edit mode) |
| import-step-3 | desktop | `docs/design/audit/import-step-3--desktop.png` | http://localhost:3000/import/21686/trees | trees step |
| account-signed-in | mobile | `docs/design/audit/account-signed-in--mobile.png` | http://localhost:3000/account |  |
| import-home | mobile | `docs/design/audit/import-home--mobile.png` | http://localhost:3000/import |  |
| import-step-1 | mobile | `docs/design/audit/import-step-1--mobile.png` | http://localhost:3000/import/21687/trip | trip step |
| import-step-2 | mobile | `docs/design/audit/import-step-2--mobile.png` | http://localhost:3000/import/21687/sites | sites step (auto-created blank site, in edit mode) |
| import-step-3 | mobile | `docs/design/audit/import-step-3--mobile.png` | http://localhost:3000/import/21687/trees | trees step |

Total screenshots: 38

## Notes / capture caveats

- Brief specified /sites/32 (and fallback /sites/1) for the "site" and "site with subsites" captures; neither id exists in this DB snapshot. Substituted /sites/436 (site-detail) and /sites/41183 (site-detail-alt, the site with the most site_visits rows -- subsites were removed from the schema entirely by legacy migration M005_RemoveSubsiteTables.cs, so "most visits" is the closest present-day analog).
- map-popup-site--desktop: no state markers found at the initial zoom to anchor a zoom-in from; NOT captured.
- map-popup-tree--desktop: no anchor available (no site or state marker found earlier); NOT captured.
- map-popup-site--mobile: no state markers found at the initial zoom to anchor a zoom-in from; NOT captured.
- map-popup-tree--mobile: no anchor available (no site or state marker found earlier); NOT captured.
- Created throwaway import-role user id=6124 (e2e-walkthrough@treesdb.invalid) via e2e/helpers/auth-user.ts's ensureThrowawayUser (same helper e2e/global-setup.ts uses).
- Import wizard throwaway trip created: id=21686 (viewport=desktop), owner user id=6124. Deleted in cleanup.
- Import wizard throwaway trip created: id=21687 (viewport=mobile), owner user id=6124. Deleted in cleanup.
- Cleanup: deleteThrowawayUserAndTrips(sql, 6124) removed trip id(s) [] via db/queries/import-drafts.sql.ts's removeTrip (cascade of import_* draft rows + any merged canonical rows), then `delete from users where id = 6124`.

## Defects

### Horizontal overflow (0)

None found.

### Broken images (0)

None found.

### Console / page errors (2)

| Page | Viewport | Message |
|---|---|---|
| not-found | desktop | Failed to load resource: the server responded with a status of 404 (Not Found) |
| not-found | mobile | Failed to load resource: the server responded with a status of 404 (Not Found) |

### Clickable targets under 24x24px (163)

| Page | Viewport | Selector | Text | Width | Height |
|---|---|---|---|---|---|
| species | desktop | `a` | 75'' | 21.8 | 40 |
| species | desktop | `a` | 96'' | 21.8 | 40 |
| species | desktop | `a` | 46'' | 21.8 | 40 |
| species | desktop | `a` | 67'' | 21.8 | 40 |
| species | desktop | `a` | 53'' | 21.8 | 40 |
| species | desktop | `a` | 79'' | 21.8 | 40 |
| species | desktop | `a` | 73'' | 21.8 | 40 |
| species | desktop | `a` | 69'' | 21.8 | 40 |
| species | desktop | `a` | 84'' | 21.8 | 40 |
| species | desktop | `a` | 83'' | 21.8 | 40 |
| species | desktop | `a` | 52'' | 21.8 | 40 |
| species | desktop | `a` | 54'' | 21.8 | 40 |
| species | desktop | `a` | 65'' | 21.8 | 40 |
| species | desktop | `a` | 72'' | 21.8 | 40 |
| species | desktop | `a` | Fir | 16.8 | 40 |
| species | desktop | `a` | 83'' | 21.8 | 40 |
| species | desktop | `a` | 51'' | 21.8 | 40 |
| species | desktop | `a` | 25'' | 21.8 | 40 |
| species | desktop | `a` | 31'' | 21.8 | 40 |
| species | desktop | `a` | 23'' | 21.8 | 40 |
| site-detail | desktop | `a.hover:underline` | 95'' | 21.8 | 40 |
| site-detail | desktop | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 40'' | 21.8 | 40 |
| site-detail-alt | desktop | `a.hover:underline` | 87'' | 21.8 | 40 |
| site-detail-alt | desktop | `a.hover:underline` | 75'' | 21.8 | 40 |
| site-detail-alt | desktop | `a.hover:underline` | 77'' | 21.8 | 40 |
| site-detail-alt | desktop | `a.text-link.hover:underline` | Mississippi (US) | 99.91 | 18 |
| state-detail | desktop | `a.hover:underline` | 58'' | 21.8 | 40 |
| state-detail | desktop | `a.hover:underline` | 68'' | 21.8 | 40 |
| state-detail | desktop | `a.hover:underline` | 46'' | 21.8 | 40 |
| state-detail | desktop | `a.hover:underline` | 67'' | 21.8 | 40 |
| state-detail | desktop | `a.hover:underline` | 19'' | 21.8 | 40 |
| state-detail | desktop | `a.hover:underline` | 13'' | 21.8 | 40 |
| state-detail | desktop | `a.hover:underline` | 49'' | 21.8 | 40 |
| state-detail | desktop | `a.hover:underline` | 69'' | 21.8 | 40 |
| tree-detail | desktop | `a.italic.text-link` | Salix alba | 72.8 | 21 |
| tree-detail | desktop | `a.text-link.hover:underline` | White Willow | 83.05 | 18 |
| tree-detail | desktop | `a.text-link.hover:underline` | Tallyrand Park | 90.31 | 18 |
| tree-detail | desktop | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| species-detail | desktop | `a.text-link.hover:underline` | 85.2' | 31.2 | 18 |
| species-detail | desktop | `a.text-link.hover:underline` | 75'' | 21.09 | 18 |
| species-detail | desktop | `a.hover:underline` | 75'' | 21.8 | 40 |
| search | desktop | `a` | Ohio's Record Pin Oak | 159.78 | 21 |
| search | desktop | `a` | Ohio Champion White Oak | 194.8 | 21 |
| search | desktop | `a` | The Angel Oak | 106.69 | 21 |
| search | desktop | `a` | Oak Creek Canyon | 133.3 | 21 |
| search | desktop | `a` | Oak Openings Preserve | 169.36 | 21 |
| search | desktop | `a` | Oak Island | 76.31 | 21 |
| search | desktop | `a` | Dover Oak | 76.69 | 21 |
| search | desktop | `a` | Oakwood | 69.64 | 21 |
| search | desktop | `a` | Oakwood Cemetery | 144.03 | 21 |
| search | desktop | `a` | Oaky Woods Wildlife Management Area | 291.23 | 21 |
| search | desktop | `a` | Oak Wood Cemetery-Chittenango | 247.48 | 21 |
| search | desktop | `a` | Oakwood Cemetery - East Aurora | 242.66 | 21 |
| search | desktop | `a` | Oak Grove Cemetery | 150.63 | 21 |
| search | desktop | `a` | Oak Creek Wildlife Area | 172.36 | 21 |
| search | desktop | `a` | Big Urban Northern Red Oak, Lorain, Ohio | 306.44 | 21 |
| search | desktop | `a` | Big Oak Tree State Park | 168.36 | 21 |
| search | desktop | `a` | Wizard Of Oz Oak Grove | 177.39 | 21 |
| search | desktop | `a` | West Fork Of Oak Creek | 173.31 | 21 |
| search | desktop | `a` | White Oak Sinks | 118.3 | 21 |
| search | desktop | `a` | Sand Barrens And Oak-Pine Forest Preserv | 314.5 | 21 |
| search | desktop | `a` | Quercus spp. | 91.55 | 21 |
| search | desktop | `a` | Lithocarpus densiflorus var. densiflorus | 279.22 | 21 |
| search | desktop | `a` | Notholithocarpus densiflorus | 208.17 | 21 |
| search | desktop | `a` | Quercus acutissima | 139.69 | 21 |
| search | desktop | `a` | Quercus alba | 94.53 | 21 |
| search | desktop | `a` | Quercus arizonica | 129.08 | 21 |
| search | desktop | `a` | Quercus arkansana | 138.2 | 21 |
| search | desktop | `a` | Quercus austrina | 122.42 | 21 |
| search | desktop | `a` | Quercus bicolor | 111.94 | 21 |
| search | desktop | `a` | Quercus castaneifolia | 154.83 | 21 |
| search | desktop | `a` | Quercus cerris | 101.27 | 21 |
| search | desktop | `a` | Quercus chrysolepis var. chrysolepis | 256 | 21 |
| search | desktop | `a` | Quercus coccinea | 123.95 | 21 |
| search | desktop | `a` | Quercus coccinea var. coccinea | 219.38 | 21 |
| search | desktop | `a` | Quercus douglasii | 128.67 | 21 |
| search | desktop | `a` | Quercus durata var. gabrielensis | 230.89 | 21 |
| search | desktop | `a` | Quercus durifolia | 124.36 | 21 |
| search | desktop | `a` | Quercus ellipsoidalis | 147.7 | 21 |
| search | desktop | `a` | Quercus emoryi | 113.23 | 21 |
| search | desktop | `a` | Quercus falcata | 112.7 | 21 |
| search | desktop | `a` | Quercus fusiformis | 134.5 | 21 |
| search | desktop | `a` | Quercus gambelii var. gambelii | 223.63 | 21 |
| search | desktop | `a` | Quercus garryana var. garryana | 229.83 | 21 |
| search | desktop | `a` | Quercus geminata | 131.64 | 21 |
| search | desktop | `a` | Quercus georgiana | 135.81 | 21 |
| map | desktop | `a` | MapLibre | 50.03 | 14 |
| map | desktop | `a` | OpenStreetMap | 84.72 | 14 |
| species | mobile | `a` | 75'' | 21.8 | 40 |
| species | mobile | `a` | 96'' | 21.8 | 40 |
| species | mobile | `a` | 46'' | 21.8 | 40 |
| species | mobile | `a` | 67'' | 21.8 | 40 |
| species | mobile | `a` | 53'' | 21.8 | 40 |
| species | mobile | `a` | 79'' | 21.8 | 40 |
| species | mobile | `a` | 73'' | 21.8 | 40 |
| species | mobile | `a` | 69'' | 21.8 | 40 |
| species | mobile | `a` | 84'' | 21.8 | 40 |
| species | mobile | `a` | 83'' | 21.8 | 40 |
| species | mobile | `a` | 52'' | 21.8 | 40 |
| species | mobile | `a` | 54'' | 21.8 | 40 |
| species | mobile | `a` | 65'' | 21.8 | 40 |
| species | mobile | `a` | 72'' | 21.8 | 40 |
| species | mobile | `a` | Fir | 16.8 | 40 |
| species | mobile | `a` | 83'' | 21.8 | 40 |
| species | mobile | `a` | 51'' | 21.8 | 40 |
| species | mobile | `a` | 25'' | 21.8 | 40 |
| species | mobile | `a` | 31'' | 21.8 | 40 |
| species | mobile | `a` | 23'' | 21.8 | 40 |
| site-detail | mobile | `a.hover:underline` | 95'' | 21.8 | 40 |
| site-detail | mobile | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 40'' | 21.8 | 40 |
| site-detail-alt | mobile | `a.hover:underline` | 87'' | 21.8 | 40 |
| site-detail-alt | mobile | `a.hover:underline` | 75'' | 21.8 | 40 |
| site-detail-alt | mobile | `a.hover:underline` | 77'' | 21.8 | 40 |
| site-detail-alt | mobile | `a.text-link.hover:underline` | Mississippi (US) | 99.91 | 18 |
| state-detail | mobile | `a.hover:underline` | 58'' | 21.8 | 40 |
| state-detail | mobile | `a.hover:underline` | 68'' | 21.8 | 40 |
| state-detail | mobile | `a.hover:underline` | 46'' | 21.8 | 40 |
| state-detail | mobile | `a.hover:underline` | 67'' | 21.8 | 40 |
| state-detail | mobile | `a.hover:underline` | 19'' | 21.8 | 40 |
| state-detail | mobile | `a.hover:underline` | 13'' | 21.8 | 40 |
| state-detail | mobile | `a.hover:underline` | 49'' | 21.8 | 40 |
| state-detail | mobile | `a.hover:underline` | 69'' | 21.8 | 40 |
| tree-detail | mobile | `a.italic.text-link` | Salix alba | 72.8 | 21 |
| tree-detail | mobile | `a.text-link.hover:underline` | White Willow | 83.05 | 18 |
| tree-detail | mobile | `a.text-link.hover:underline` | Tallyrand Park | 90.31 | 18 |
| tree-detail | mobile | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| search | mobile | `a` | Ohio's Record Pin Oak | 160.61 | 21 |
| search | mobile | `a` | Oak Creek Canyon | 154.72 | 21 |
| search | mobile | `a` | Oak Openings Preserve | 185.13 | 21 |
| search | mobile | `a` | Oak Island | 105.39 | 21 |
| search | mobile | `a` | Dover Oak | 140.52 | 21 |
| search | mobile | `a` | Oakwood | 136.16 | 21 |
| search | mobile | `a` | White Oak Sinks | 149.98 | 21 |
| search | mobile | `a` | Quercus spp. | 248.58 | 21 |
| search | mobile | `a` | Notholithocarpus densiflorus | 231.89 | 21 |
| search | mobile | `a` | Quercus acutissima | 193.48 | 21 |
| search | mobile | `a` | Quercus alba | 212.94 | 21 |
| search | mobile | `a` | Quercus arizonica | 168 | 21 |
| search | mobile | `a` | Quercus arkansana | 196.61 | 21 |
| search | mobile | `a` | Quercus austrina | 168.78 | 21 |
| search | mobile | `a` | Quercus bicolor | 170.05 | 21 |
| search | mobile | `a` | Quercus cerris | 154.72 | 21 |
| search | mobile | `a` | Quercus coccinea | 208.55 | 21 |
| search | mobile | `a` | Quercus douglasii | 221.52 | 21 |
| search | mobile | `a` | Quercus durifolia | 159.23 | 21 |
| search | mobile | `a` | Quercus ellipsoidalis | 174.53 | 21 |
| search | mobile | `a` | Quercus emoryi | 210.25 | 21 |
| search | mobile | `a` | Quercus falcata | 171.38 | 21 |
| search | mobile | `a` | Quercus fusiformis | 191.33 | 21 |
| search | mobile | `a` | Quercus geminata | 193.58 | 21 |
| search | mobile | `a` | Quercus georgiana | 202.41 | 21 |
| map | mobile | `a` | MapLibre | 50.03 | 14 |
| map | mobile | `a` | OpenStreetMap | 84.72 | 14 |
| import-home | desktop | `a.block.text-center` | View import history → | 640 | 20 |
| import-step-1 | desktop | `a.mb-2.inline-flex` | All imports | 90.64 | 20 |
| import-step-2 | desktop | `a.mb-2.inline-flex` | All imports | 90.64 | 20 |
| import-step-3 | desktop | `a.mb-2.inline-flex` | All imports | 90.64 | 20 |
| import-home | mobile | `a.block.text-center` | View import history → | 358 | 20 |
| import-step-1 | mobile | `a.mb-2.inline-flex` | All imports | 90.64 | 20 |
| import-step-2 | mobile | `a.mb-2.inline-flex` | All imports | 90.64 | 20 |
| import-step-3 | mobile | `a.mb-2.inline-flex` | All imports | 90.64 | 20 |
