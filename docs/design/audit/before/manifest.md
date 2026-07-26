# Design audit manifest

Generated 2026-07-19T03:33:38.632Z by `web/scripts/design-audit/capture.ts` against http://localhost:3000.

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
| map-popup-site | desktop | `docs/design/audit/map-popup-site--desktop.png` | http://localhost:3000/map | site marker popup, found by wheel-zooming in from a state marker anchor and re-targeting on canvas pixel-color matches each round |
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
| map-popup-site | mobile | `docs/design/audit/map-popup-site--mobile.png` | http://localhost:3000/map | site marker popup, found by wheel-zooming in from a state marker anchor and re-targeting on canvas pixel-color matches each round |
| account-signed-in | desktop | `docs/design/audit/account-signed-in--desktop.png` | http://localhost:3000/account |  |
| import-home | desktop | `docs/design/audit/import-home--desktop.png` | http://localhost:3000/import |  |
| import-step-1 | desktop | `docs/design/audit/import-step-1--desktop.png` | http://localhost:3000/import/21681/trip | trip step |
| import-step-2 | desktop | `docs/design/audit/import-step-2--desktop.png` | http://localhost:3000/import/21681/sites | sites step (auto-created blank site, in edit mode) |
| import-step-3 | desktop | `docs/design/audit/import-step-3--desktop.png` | http://localhost:3000/import/21681/trees | trees step |
| account-signed-in | mobile | `docs/design/audit/account-signed-in--mobile.png` | http://localhost:3000/account |  |
| import-home | mobile | `docs/design/audit/import-home--mobile.png` | http://localhost:3000/import |  |
| import-step-1 | mobile | `docs/design/audit/import-step-1--mobile.png` | http://localhost:3000/import/21682/trip | trip step |
| import-step-2 | mobile | `docs/design/audit/import-step-2--mobile.png` | http://localhost:3000/import/21682/sites | sites step (auto-created blank site, in edit mode) |
| import-step-3 | mobile | `docs/design/audit/import-step-3--mobile.png` | http://localhost:3000/import/21682/trees | trees step |

Total screenshots: 40

## Notes / capture caveats

- Brief specified /sites/32 (and fallback /sites/1) for the "site" and "site with subsites" captures; neither id exists in this DB snapshot. Substituted /sites/436 (site-detail) and /sites/41183 (site-detail-alt, the site with the most site_visits rows -- subsites were removed from the schema entirely by legacy migration M005_RemoveSubsiteTables.cs, so "most visits" is the closest present-day analog).
- Map popup close button (map-popup-site, desktop): 7.02px x 20px (clickable box).
- map-popup-tree--desktop: wheel-zoom convergence never revealed a tree marker within budget (this area's sites may not have individually-geocoded trees); NOT captured.
- Map popup close button (map-popup-site, mobile): 7.02px x 20px (clickable box).
- map-popup-tree--mobile: wheel-zoom convergence never revealed a tree marker within budget (this area's sites may not have individually-geocoded trees); NOT captured.
- Created throwaway import-role user id=6121 (e2e-walkthrough@treesdb.invalid) via e2e/helpers/auth-user.ts's ensureThrowawayUser (same helper e2e/global-setup.ts uses).
- Import wizard throwaway trip created: id=21681 (viewport=desktop), owner user id=6121. Deleted in cleanup.
- Import wizard throwaway trip created: id=21682 (viewport=mobile), owner user id=6121. Deleted in cleanup.
- Cleanup: deleteThrowawayUserAndTrips(sql, 6121) removed trip id(s) [] via db/queries/import-drafts.sql.ts's removeTrip (cascade of import_* draft rows + any merged canonical rows), then `delete from users where id = 6121`.

## Defects

### Horizontal overflow (0)

None found.

### Broken images (0)

None found.

### Console / page errors (4)

| Page | Viewport | Message |
|---|---|---|
| not-found | desktop | Failed to load resource: the server responded with a status of 404 (Not Found) |
| not-found | mobile | Failed to load resource: the server responded with a status of 404 (Not Found) |
| account-signed-in | desktop | Base UI: A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` prop, or set `nativeButton` to `false`.
    at Button |
| account-signed-in | mobile | Base UI: A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` prop, or set `nativeButton` to `false`.
    at Button |

### Clickable targets under 24x24px (1032)

| Page | Viewport | Selector | Text | Width | Height |
|---|---|---|---|---|---|
| locations | desktop | `a.inline-flex.items-center` | Site | 25.97 | 20 |
| locations | desktop | `a.inline-flex.items-center` | County | 47.23 | 20 |
| locations | desktop | `a.inline-flex.items-center` | State | 35.28 | 20 |
| locations | desktop | `a.inline-flex.items-center` | RHI5 | 32.19 | 20 |
| locations | desktop | `a.inline-flex.items-center` | RHI10 | 38.16 | 20 |
| locations | desktop | `a.inline-flex.items-center` | RGI5 | 32.19 | 20 |
| locations | desktop | `a.inline-flex.items-center` | RGI10 | 38.16 | 20 |
| locations | desktop | `a.inline-flex.items-center` | Last measurement | 122.42 | 20 |
| locations | desktop | `a` | Horse Creek | 79.14 | 18 |
| locations | desktop | `a` | North Carolina | 92.63 | 18 |
| locations | desktop | `a` | Frozen Head State Park | 151.14 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Big South Fork | 94.97 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Shakerag Hollow | 108.38 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | College Of The South | 136.14 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Bearwaller Gap Trail | 128.38 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Winding Stairs Park | 125.92 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Torreya State Park | 117.13 | 18 |
| locations | desktop | `a` | Florida | 43.59 | 18 |
| locations | desktop | `a` | Radnor Lake State Park | 151.89 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Montgomery Bell State Park | 180.03 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Holly River State Park | 139.36 | 18 |
| locations | desktop | `a` | West Virginia | 84.16 | 18 |
| locations | desktop | `a` | Abraham Lincoln Park | 140.3 | 18 |
| locations | desktop | `a` | New York | 60.86 | 18 |
| locations | desktop | `a` | Lucien Morin County Park | 164.84 | 18 |
| locations | desktop | `a` | New York | 60.86 | 18 |
| locations | desktop | `a` | Ellison Park | 75.2 | 18 |
| locations | desktop | `a` | New York | 60.86 | 18 |
| locations | desktop | `a` | Pickett CCC Memorial State Park | 210.84 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Dunbar Cave State Park | 153.53 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Lafayette TN Downtown | 153.25 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Marshall Forest | 98.63 | 18 |
| locations | desktop | `a` | Georgia | 49.39 | 18 |
| locations | desktop | `a` | Virgin Falls State Natural Area | 191.44 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Bridgestone Nature Reserve | 179.55 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Overton Park | 83.98 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Hatchie National Wildlife Refuge | 205.66 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Hematite Lake | 92.59 | 18 |
| locations | desktop | `a` | Kentucky | 59.23 | 18 |
| locations | desktop | `a` | Standing Stone State Park | 169.22 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Collins Gulf | 74.08 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Nathan Bedford Forrest State Park | 220.06 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | First Branch | 77.47 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Cucumber Gap | 96.03 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Burnt Mountain | 98.95 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Boulevard Prong | 105.89 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Cheatham WMA | 103.88 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Meeman-Shelby Forest State Park | 220.11 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Edgar Evins State Park | 146.11 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | T.O. Fuller State Park | 132.11 | 18 |
| locations | desktop | `a` | Tennessee | 67.72 | 18 |
| locations | desktop | `a` | Valles Caldera National Preserve | 207.66 | 18 |
| locations | desktop | `a` | New Mexico | 78.33 | 18 |
| locations | desktop | `a` | Flagstaff Snow Bowl Road | 168.89 | 18 |
| locations | desktop | `a` | Arizona | 47.94 | 18 |
| locations | desktop | `a` | Vicente Flat Trail | 105.83 | 18 |
| locations | desktop | `a` | California | 60.33 | 18 |
| locations | desktop | `a` | Mt. San Jacinto Long Valley | 177.42 | 18 |
| locations | desktop | `a` | California | 60.33 | 18 |
| locations | desktop | `a` | Mt. San Jacinto Deer Springs Trail | 216.61 | 18 |
| locations | desktop | `a` | California | 60.33 | 18 |
| locations | desktop | `a` | Big Bear Highway (CA-18) | 162 | 18 |
| locations | desktop | `a` | California | 60.33 | 18 |
| species | desktop | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| species | desktop | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| species | desktop | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| species | desktop | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| species | desktop | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| species | desktop | `a` | Abies alba | 66.34 | 18 |
| species | desktop | `a` | Silver Fir | 56.27 | 18 |
| species | desktop | `a` | 85.2' | 31.2 | 18 |
| species | desktop | `a` | 75'' | 21.09 | 18 |
| species | desktop | `a` | Abies amabilis | 92.08 | 18 |
| species | desktop | `a` | Pacific Silver Fir | 102.33 | 18 |
| species | desktop | `a` | 199.0' | 36.58 | 18 |
| species | desktop | `a` | 160'' | 27.81 | 18 |
| species | desktop | `a` | 27.0' | 28.78 | 18 |
| species | desktop | `a` | Abies balsamea | 101.38 | 18 |
| species | desktop | `a` | Balsam Fir | 68.2 | 18 |
| species | desktop | `a` | 103.9' | 36.72 | 18 |
| species | desktop | `a` | 96'' | 21.73 | 18 |
| species | desktop | `a` | 43.0' | 31.5 | 18 |
| species | desktop | `a` | Abies balsamea var. balsamea | 192.86 | 18 |
| species | desktop | `a` | Balsam Fir | 68.2 | 18 |
| species | desktop | `a` | 108.7' | 34.78 | 18 |
| species | desktop | `a` | 115'' | 23.95 | 18 |
| species | desktop | `a` | 38.2' | 31.02 | 18 |
| species | desktop | `a` | Abies cephalonica | 116.3 | 18 |
| species | desktop | `a` | Greek Fir | 58.53 | 18 |
| species | desktop | `a` | 105.5' | 37.36 | 18 |
| species | desktop | `a` | 111'' | 20 | 18 |
| species | desktop | `a` | Abies chinsiensis | 109.86 | 18 |
| species | desktop | `a` | Shensi Fir | 63.63 | 18 |
| species | desktop | `a` | 70.0' | 31.22 | 18 |
| species | desktop | `a` | 100'' | 28.94 | 18 |
| species | desktop | `a` | Abies cilicica | 82.92 | 18 |
| species | desktop | `a` | Cilician Fir | 66.91 | 18 |
| species | desktop | `a` | 51.3' | 28.03 | 18 |
| species | desktop | `a` | 46'' | 21.77 | 18 |
| species | desktop | `a` | Abies concolor | 94.69 | 18 |
| species | desktop | `a` | White Fir | 57.23 | 18 |
| species | desktop | `a` | 163.5' | 36.2 | 18 |
| species | desktop | `a` | 126'' | 27.2 | 18 |
| species | desktop | `a` | 45.3' | 31.27 | 18 |
| species | desktop | `a` | Abies concolor var. concolor | 179.47 | 18 |
| species | desktop | `a` | White Fir | 57.23 | 18 |
| species | desktop | `a` | 104.0' | 37.58 | 18 |
| species | desktop | `a` | 67'' | 20.06 | 18 |
| species | desktop | `a` | Abies concolor var. lowiana | 173.13 | 18 |
| species | desktop | `a` | White Fir | 57.23 | 18 |
| species | desktop | `a` | 242.1' | 34.95 | 18 |
| species | desktop | `a` | 219'' | 27.2 | 18 |
| species | desktop | `a` | Abies concolor var. lowiana x abies gran | 273.16 | 18 |
| species | desktop | `a` | Hybrid Fir | 62.2 | 18 |
| species | desktop | `a` | 206.9' | 40 | 18 |
| species | desktop | `a` | 129'' | 27.2 | 18 |
| species | desktop | `a` | Abies fargesii | 86.14 | 18 |
| species | desktop | `a` | Farges Fir | 63.84 | 18 |
| species | desktop | `a` | 57.0' | 28.59 | 18 |
| species | desktop | `a` | 53'' | 22.34 | 18 |
| species | desktop | `a` | Abies firma | 72.11 | 18 |
| species | desktop | `a` | Momi Fir | 55.92 | 18 |
| species | desktop | `a` | 70.8' | 30.39 | 18 |
| species | desktop | `a` | 79'' | 20.63 | 18 |
| species | desktop | `a` | Abies fraseri | 79.69 | 18 |
| species | desktop | `a` | Fraser Fir | 60.67 | 18 |
| species | desktop | `a` | 64.8' | 30.69 | 18 |
| species | desktop | `a` | 73'' | 20.91 | 18 |
| species | desktop | `a` | 27.0' | 28.78 | 18 |
| species | desktop | `a` | Abies grandis | 86.33 | 18 |
| species | desktop | `a` | Grand Fir | 58.8 | 18 |
| species | desktop | `a` | 170.1' | 31.28 | 18 |
| species | desktop | `a` | 132'' | 27.61 | 18 |
| species | desktop | `a` | Abies grandis var. grandis | 162.75 | 18 |
| species | desktop | `a` | Grand Fir | 58.8 | 18 |
| species | desktop | `a` | 223.4' | 39.42 | 18 |
| species | desktop | `a` | 269'' | 30.27 | 18 |
| species | desktop | `a` | Abies grandis var. idahoensis | 183.75 | 18 |
| species | desktop | `a` | Grand Fir | 58.8 | 18 |
| species | desktop | `a` | 215.6' | 36.28 | 18 |
| species | desktop | `a` | 159'' | 27.44 | 18 |
| species | desktop | `a` | Abies holophylla | 104.77 | 18 |
| species | desktop | `a` | Manchurian Fir | 95.48 | 18 |
| species | desktop | `a` | 87.3' | 28 | 18 |
| species | desktop | `a` | 69'' | 21.59 | 18 |
| species | desktop | `a` | 25.2' | 31.41 | 18 |
| species | desktop | `a` | Abies homolepis | 105.06 | 18 |
| species | desktop | `a` | Nikko Fir | 56.69 | 18 |
| species | desktop | `a` | 108.5' | 37.05 | 18 |
| species | desktop | `a` | 132'' | 27.61 | 18 |
| species | desktop | `a` | Abies lasiocarpa | 104.91 | 18 |
| species | desktop | `a` | Subalpine Fir | 84.25 | 18 |
| species | desktop | `a` | 133.0' | 37.14 | 18 |
| species | desktop | `a` | 84'' | 21.92 | 18 |
| species | desktop | `a` | Abies lasiocarpa var. arizonica | 191.58 | 18 |
| species | desktop | `a` | Corkbark Fir | 79.55 | 18 |
| species | desktop | `a` | 123.0' | 36.8 | 18 |
| species | desktop | `a` | 115'' | 23.95 | 18 |
| species | desktop | `a` | Abies lasiocarpa var. bifolia | 172.47 | 18 |
| species | desktop | `a` | Subalpine Fir | 84.25 | 18 |
| species | desktop | `a` | 142.2' | 36.36 | 18 |
| species | desktop | `a` | 83'' | 22.03 | 18 |
| species | desktop | `a` | Abies lasiocarpa var. lasiocarpa | 199.91 | 18 |
| species | desktop | `a` | Subalpine Fir | 84.25 | 18 |
| species | desktop | `a` | 97.4' | 27.47 | 18 |
| species | desktop | `a` | 52'' | 22.28 | 18 |
| species | desktop | `a` | Abies lasiocarpa var. latifolia | 180.3 | 18 |
| species | desktop | `a` | Subalpine Fir | 84.25 | 18 |
| species | desktop | `a` | 80.4' | 31.52 | 18 |
| species | desktop | `a` | 54'' | 22.22 | 18 |
| species | desktop | `a` | Abies lowiana | 88.33 | 18 |
| species | desktop | `a` | Sierra White Fir | 98.06 | 18 |
| species | desktop | `a` | 173.6' | 34.63 | 18 |
| species | desktop | `a` | 211'' | 23.7 | 18 |
| species | desktop | `a` | Abies magnifica | 101.59 | 18 |
| species | desktop | `a` | California Red Fir | 109.41 | 18 |
| species | desktop | `a` | 220.2' | 40.59 | 18 |
| species | desktop | `a` | 304'' | 31.19 | 18 |
| species | desktop | `a` | Abies nordmanniana | 130.39 | 18 |
| species | desktop | `a` | Nordmann Fir | 87.38 | 18 |
| species | desktop | `a` | 116.7' | 30.16 | 18 |
| species | desktop | `a` | 138'' | 27.41 | 18 |
| species | desktop | `a` | 39.0' | 31.48 | 18 |
| species | desktop | `a` | Abies numidica | 97.22 | 18 |
| species | desktop | `a` | Algerian Fir | 72.86 | 18 |
| species | desktop | `a` | 100.5' | 38.02 | 18 |
| species | desktop | `a` | 103'' | 28.09 | 18 |
| species | desktop | `a` | Abies pinsapo | 89.91 | 18 |
| species | desktop | `a` | Spanish Fir | 71.89 | 18 |
| species | desktop | `a` | 71.7' | 24.66 | 18 |
| species | desktop | `a` | 126'' | 27.2 | 18 |
| species | desktop | `a` | Abies procera | 87.53 | 18 |
| species | desktop | `a` | Noble Fir | 58.2 | 18 |
| species | desktop | `a` | 274.3' | 37.25 | 18 |
| species | desktop | `a` | 314'' | 27.14 | 18 |
| species | desktop | `a` | 30.0' | 32.45 | 18 |
| species | desktop | `a` | Abies recurvata var. ernestii | 175.23 | 18 |
| species | desktop | `a` | Min Fir | 43.92 | 18 |
| species | desktop | `a` | 87.4' | 27.89 | 18 |
| species | desktop | `a` | 65'' | 22.06 | 18 |
| species | desktop | `a` | Abies religiosa | 92.78 | 18 |
| species | desktop | `a` | Sacred Fir | 65.31 | 18 |
| species | desktop | `a` | 80.6' | 31.36 | 18 |
| species | desktop | `a` | Abies sachalinensis | 125.55 | 18 |
| species | desktop | `a` | Sakhalin Fir | 75.39 | 18 |
| species | desktop | `a` | 85.0' | 31.81 | 18 |
| species | desktop | `a` | 72'' | 20.86 | 18 |
| species | desktop | `a` | Abies spp. | 65.52 | 18 |
| species | desktop | `a` | Fir | 16.8 | 18 |
| species | desktop | `a` | 81.4' | 27.33 | 18 |
| species | desktop | `a` | 83'' | 22.03 | 18 |
| species | desktop | `a` | Abies veitchii | 84.13 | 18 |
| species | desktop | `a` | Shikoku Fir | 72.08 | 18 |
| species | desktop | `a` | 54.4' | 31.16 | 18 |
| species | desktop | `a` | 51'' | 19.13 | 18 |
| species | desktop | `a` | Acacia greggii | 90.05 | 18 |
| species | desktop | `a` | Catclaw Acacia | 98.66 | 18 |
| species | desktop | `a` | 23.3' | 30.86 | 18 |
| species | desktop | `a` | 25'' | 22.42 | 18 |
| species | desktop | `a` | Acer ×freemanii | 99.84 | 18 |
| species | desktop | `a` | Freeman Maple | 99.02 | 18 |
| species | desktop | `a` | 135.7' | 34.53 | 18 |
| species | desktop | `a` | 165'' | 27.3 | 18 |
| species | desktop | `a` | Acer barbatum | 95.19 | 18 |
| species | desktop | `a` | Southern Sugar Maple | 143.23 | 18 |
| species | desktop | `a` | 109.0' | 37.42 | 18 |
| species | desktop | `a` | 104'' | 27.84 | 18 |
| species | desktop | `a` | Acer buergenlarium | 125.25 | 18 |
| species | desktop | `a` | Trident Maple | 87.23 | 18 |
| species | desktop | `a` | 38.8' | 30.81 | 18 |
| species | desktop | `a` | 31'' | 18.95 | 18 |
| species | desktop | `a` | Acer campestre | 101.41 | 18 |
| species | desktop | `a` | Hedge Maple | 84.84 | 18 |
| species | desktop | `a` | 60.6' | 31.2 | 18 |
| species | desktop | `a` | 23'' | 21.95 | 18 |
| site-detail | desktop | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| site-detail | desktop | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| site-detail | desktop | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| site-detail | desktop | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| site-detail | desktop | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| site-detail | desktop | `a.italic.hover:underline` | Thuja occidentalis | 114.78 | 18 |
| site-detail | desktop | `a.hover:underline` | Arborvitae | 66.05 | 18 |
| site-detail | desktop | `a.hover:underline` | 47.0' | 28.72 | 18 |
| site-detail | desktop | `a.hover:underline` | 95'' | 22.06 | 18 |
| site-detail | desktop | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| site-detail-alt | desktop | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| site-detail-alt | desktop | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| site-detail-alt | desktop | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| site-detail-alt | desktop | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| site-detail-alt | desktop | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Acer rubrum | 79.55 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Red Maple | 68.36 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 125.2' | 36.64 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 107'' | 26.28 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Carpinus caroliniana | 130.38 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | American Hornbeam | 130.61 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 45.0' | 31.97 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 40'' | 22.75 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Carya cordiformis | 112.06 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Bitternut Hickory | 107.17 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 130.5' | 37.31 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 113'' | 23.77 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Carya glabra | 81.14 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Pignut Hickory | 93.39 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 132.9' | 36.23 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 199'' | 26.97 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 64.0' | 31.5 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Carya laciniosa | 97.47 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Shellbark Hickory | 113.2 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 115.5' | 33.03 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 87'' | 20.5 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Carya ovata | 75.78 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Shagbark Hickory | 113.95 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 112.5' | 32.8 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 75'' | 21.09 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Carya spp. | 67.31 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Hickory | 48.41 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 114.0' | 33.13 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 120'' | 28.17 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Carya tomentosa | 109.58 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Mockernut Hickory | 120.52 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 135.0' | 37.31 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 120'' | 28.17 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Diospyros virginiana | 128.67 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | Common Persimmon | 133.17 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 105.0' | 37.88 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 77'' | 19.94 | 18 |
| site-detail-alt | desktop | `a.italic.hover:underline` | Fagus grandifolia | 109.59 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | American Beech | 104.61 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 114.0' | 33.13 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 144'' | 27.17 | 18 |
| site-detail-alt | desktop | `a.hover:underline` | 97.0' | 28.28 | 18 |
| site-detail-alt | desktop | `a.text-link.hover:underline` | Mississippi (US) | 99.91 | 18 |
| state-detail | desktop | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| state-detail | desktop | `a.italic.hover:underline` | Abies balsamea | 101.38 | 18 |
| state-detail | desktop | `a.hover:underline` | Balsam Fir | 68.2 | 18 |
| state-detail | desktop | `a.hover:underline` | 103.9' | 36.72 | 18 |
| state-detail | desktop | `a.hover:underline` | 58'' | 22.22 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies balsamea var. balsamea | 192.86 | 18 |
| state-detail | desktop | `a.hover:underline` | Balsam Fir | 68.2 | 18 |
| state-detail | desktop | `a.hover:underline` | 108.7' | 34.78 | 18 |
| state-detail | desktop | `a.hover:underline` | 68'' | 21.75 | 18 |
| state-detail | desktop | `a.hover:underline` | 17.0' | 25.63 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies cephalonica | 116.3 | 18 |
| state-detail | desktop | `a.hover:underline` | Greek Fir | 58.53 | 18 |
| state-detail | desktop | `a.hover:underline` | 105.5' | 37.36 | 18 |
| state-detail | desktop | `a.hover:underline` | 111'' | 20 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies cilicica | 82.92 | 18 |
| state-detail | desktop | `a.hover:underline` | Cilician Fir | 66.91 | 18 |
| state-detail | desktop | `a.hover:underline` | 51.3' | 28.03 | 18 |
| state-detail | desktop | `a.hover:underline` | 46'' | 21.77 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies concolor | 94.69 | 18 |
| state-detail | desktop | `a.hover:underline` | White Fir | 57.23 | 18 |
| state-detail | desktop | `a.hover:underline` | 113.0' | 33.38 | 18 |
| state-detail | desktop | `a.hover:underline` | 100'' | 28.94 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies concolor var. concolor | 179.47 | 18 |
| state-detail | desktop | `a.hover:underline` | White Fir | 57.23 | 18 |
| state-detail | desktop | `a.hover:underline` | 76.3' | 29.53 | 18 |
| state-detail | desktop | `a.hover:underline` | 67'' | 20.06 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies firma | 72.11 | 18 |
| state-detail | desktop | `a.hover:underline` | Momi Fir | 55.92 | 18 |
| state-detail | desktop | `a.hover:underline` | 35.6' | 30.97 | 18 |
| state-detail | desktop | `a.hover:underline` | 19'' | 18.67 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies fraseri | 79.69 | 18 |
| state-detail | desktop | `a.hover:underline` | Fraser Fir | 60.67 | 18 |
| state-detail | desktop | `a.hover:underline` | 26.5' | 31.05 | 18 |
| state-detail | desktop | `a.hover:underline` | 13'' | 18.95 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies grandis | 86.33 | 18 |
| state-detail | desktop | `a.hover:underline` | Grand Fir | 58.8 | 18 |
| state-detail | desktop | `a.hover:underline` | 60.1' | 27.16 | 18 |
| state-detail | desktop | `a.hover:underline` | 49'' | 21.91 | 18 |
| state-detail | desktop | `a.italic.hover:underline` | Abies holophylla | 104.77 | 18 |
| state-detail | desktop | `a.hover:underline` | Manchurian Fir | 95.48 | 18 |
| state-detail | desktop | `a.hover:underline` | 87.3' | 28 | 18 |
| state-detail | desktop | `a.hover:underline` | 69'' | 21.59 | 18 |
| state-detail | desktop | `a.inline-flex.items-center` | Site | 25.97 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | RHI5 | 32.19 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | RHI10 | 38.16 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | RGI5 | 32.19 | 20 |
| state-detail | desktop | `a.inline-flex.items-center` | RGI10 | 38.16 | 20 |
| state-detail | desktop | `a.hover:underline` | 184 Main St., Moravia, NY | 159.41 | 18 |
| state-detail | desktop | `a.hover:underline` | Abraham Lincoln Park | 140.3 | 18 |
| state-detail | desktop | `a.hover:underline` | Alexander Preserve | 124.02 | 18 |
| state-detail | desktop | `a.hover:underline` | All Saints Chapel | 108.97 | 18 |
| state-detail | desktop | `a.hover:underline` | Alley Pond Park | 100.83 | 18 |
| state-detail | desktop | `a.hover:underline` | Allison Park | 75.83 | 18 |
| state-detail | desktop | `a.hover:underline` | Ampersand Basin | 112.33 | 18 |
| state-detail | desktop | `a.hover:underline` | Ampersand Mountain | 136.75 | 18 |
| state-detail | desktop | `a.hover:underline` | Ascent Of Mount Van Dorrien | 186.45 | 18 |
| state-detail | desktop | `a.hover:underline` | Bailey Arboretum | 110.41 | 18 |
| tree-detail | desktop | `a.italic.text-link` | Salix alba | 62.02 | 18 |
| tree-detail | desktop | `a.text-link.hover:underline` | White Willow | 83.05 | 18 |
| tree-detail | desktop | `a.text-link.hover:underline` | Tallyrand Park | 90.31 | 18 |
| tree-detail | desktop | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| search | desktop | `a.home-link` | ← TreesDb | 65.53 | 19 |
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
| search | desktop | `a` | Quercus spp. | 93.91 | 21 |
| search | desktop | `a` | Lithocarpus densiflorus var. densiflorus | 282.13 | 21 |
| search | desktop | `a` | Notholithocarpus densiflorus | 211.52 | 21 |
| search | desktop | `a` | Quercus acutissima | 139.55 | 21 |
| search | desktop | `a` | Quercus alba | 94.2 | 21 |
| search | desktop | `a` | Quercus arizonica | 128.7 | 21 |
| search | desktop | `a` | Quercus arkansana | 137.17 | 21 |
| search | desktop | `a` | Quercus austrina | 122.03 | 21 |
| search | desktop | `a` | Quercus bicolor | 114.42 | 21 |
| search | desktop | `a` | Quercus castaneifolia | 154.58 | 21 |
| search | desktop | `a` | Quercus cerris | 102.81 | 21 |
| search | desktop | `a` | Quercus chrysolepis var. chrysolepis | 260.11 | 21 |
| search | desktop | `a` | Quercus coccinea | 126.36 | 21 |
| search | desktop | `a` | Quercus coccinea var. coccinea | 222.33 | 21 |
| search | desktop | `a` | Quercus douglasii | 129.83 | 21 |
| search | desktop | `a` | Quercus durata var. gabrielensis | 230.95 | 21 |
| search | desktop | `a` | Quercus durifolia | 124.73 | 21 |
| search | desktop | `a` | Quercus ellipsoidalis | 148.44 | 21 |
| search | desktop | `a` | Quercus emoryi | 114.97 | 21 |
| search | desktop | `a` | Quercus falcata | 111.92 | 21 |
| search | desktop | `a` | Quercus fusiformis | 136.05 | 21 |
| search | desktop | `a` | Quercus gambelii var. gambelii | 223.03 | 21 |
| search | desktop | `a` | Quercus garryana var. garryana | 226.64 | 21 |
| search | desktop | `a` | Quercus geminata | 132.19 | 21 |
| search | desktop | `a` | Quercus georgiana | 137.2 | 21 |
| activity | desktop | `a.text-link.hover:underline` | Horse Creek | 79.14 | 18 |
| activity | desktop | `a.text-link.hover:underline` | North Carolina | 92.63 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Frozen Head State Park | 151.14 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Big South Fork | 94.97 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Shakerag Hollow | 108.38 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | College Of The South | 136.14 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Bearwaller Gap Trail | 128.38 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Winding Stairs Park | 125.92 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Torreya State Park | 117.13 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Florida | 43.59 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Radnor Lake State Park | 151.89 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Montgomery Bell State Park | 180.03 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Holly River State Park | 139.36 | 18 |
| activity | desktop | `a.text-link.hover:underline` | West Virginia | 84.16 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Ellison Park | 75.2 | 18 |
| activity | desktop | `a.text-link.hover:underline` | New York | 60.86 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Abraham Lincoln Park | 140.3 | 18 |
| activity | desktop | `a.text-link.hover:underline` | New York | 60.86 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Lucien Morin County Park | 164.84 | 18 |
| activity | desktop | `a.text-link.hover:underline` | New York | 60.86 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Pickett CCC Memorial State Park | 210.84 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Dunbar Cave State Park | 153.53 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Lafayette TN Downtown | 153.25 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Marshall Forest | 98.63 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Georgia | 49.39 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Virgin Falls State Natural Area | 191.44 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Bridgestone Nature Reserve | 179.55 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Overton Park | 83.98 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Hatchie National Wildlife Refuge | 205.66 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Hematite Lake | 92.59 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Kentucky | 59.23 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Standing Stone State Park | 169.22 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Collins Gulf | 74.08 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Nathan Bedford Forrest State Park | 220.06 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Burnt Mountain | 98.95 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Cucumber Gap | 96.03 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | First Branch | 77.47 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Boulevard Prong | 105.89 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Cheatham WMA | 103.88 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Meeman-Shelby Forest State Park | 220.11 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Edgar Evins State Park | 146.11 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | T.O. Fuller State Park | 132.11 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Valles Caldera National Preserve | 207.66 | 18 |
| activity | desktop | `a.text-link.hover:underline` | New Mexico | 78.33 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Flagstaff Snow Bowl Road | 168.89 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Arizona | 47.94 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Vicente Flat Trail | 105.83 | 18 |
| activity | desktop | `a.text-link.hover:underline` | California | 60.33 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Mt. San Jacinto Long Valley | 177.42 | 18 |
| activity | desktop | `a.text-link.hover:underline` | California | 60.33 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Mt. San Jacinto Deer Springs Trail | 216.61 | 18 |
| activity | desktop | `a.text-link.hover:underline` | California | 60.33 | 18 |
| activity | desktop | `a.text-link.hover:underline` | Big Bear Highway (CA-18) | 162 | 18 |
| activity | desktop | `a.text-link.hover:underline` | California | 60.33 | 18 |
| map | desktop | `a` | MapLibre | 50.03 | 14 |
| map | desktop | `a` | OpenStreetMap | 84.72 | 14 |
| map-popup-site | desktop | `.maplibregl-popup-close-button` | × | 7.02 | 20 |
| map-popup-site | desktop | `a` | MapLibre | 50.03 | 14 |
| map-popup-site | desktop | `a` | OpenStreetMap | 84.72 | 14 |
| map-popup-site | desktop | `a.shrink-0.text-xs` | View more details | 94.5 | 16 |
| map-popup-site | desktop | `button.maplibregl-popup-close-button` | × | 7.02 | 20 |
| locations | mobile | `a.inline-flex.items-center` | Site | 25.97 | 20 |
| locations | mobile | `a.inline-flex.items-center` | County | 47.23 | 20 |
| locations | mobile | `a.inline-flex.items-center` | State | 35.28 | 20 |
| locations | mobile | `a.inline-flex.items-center` | RHI5 | 32.19 | 20 |
| locations | mobile | `a.inline-flex.items-center` | RHI10 | 38.16 | 20 |
| locations | mobile | `a.inline-flex.items-center` | RGI5 | 32.19 | 20 |
| locations | mobile | `a.inline-flex.items-center` | RGI10 | 38.16 | 20 |
| locations | mobile | `a.inline-flex.items-center` | Last measurement | 122.42 | 20 |
| locations | mobile | `a` | Horse Creek | 79.14 | 18 |
| locations | mobile | `a` | North Carolina | 92.63 | 18 |
| locations | mobile | `a` | Frozen Head State Park | 151.14 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Big South Fork | 94.97 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Shakerag Hollow | 108.38 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | College Of The South | 136.14 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Bearwaller Gap Trail | 128.38 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Winding Stairs Park | 125.92 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Torreya State Park | 117.13 | 18 |
| locations | mobile | `a` | Florida | 43.59 | 18 |
| locations | mobile | `a` | Radnor Lake State Park | 151.89 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Montgomery Bell State Park | 180.03 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Holly River State Park | 139.36 | 18 |
| locations | mobile | `a` | West Virginia | 84.16 | 18 |
| locations | mobile | `a` | Abraham Lincoln Park | 140.3 | 18 |
| locations | mobile | `a` | New York | 60.86 | 18 |
| locations | mobile | `a` | Lucien Morin County Park | 164.84 | 18 |
| locations | mobile | `a` | New York | 60.86 | 18 |
| locations | mobile | `a` | Ellison Park | 75.2 | 18 |
| locations | mobile | `a` | New York | 60.86 | 18 |
| locations | mobile | `a` | Pickett CCC Memorial State Park | 210.84 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Dunbar Cave State Park | 153.53 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Lafayette TN Downtown | 153.25 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Marshall Forest | 98.63 | 18 |
| locations | mobile | `a` | Georgia | 49.39 | 18 |
| locations | mobile | `a` | Virgin Falls State Natural Area | 191.44 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Bridgestone Nature Reserve | 179.55 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Overton Park | 83.98 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Hatchie National Wildlife Refuge | 205.66 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Hematite Lake | 92.59 | 18 |
| locations | mobile | `a` | Kentucky | 59.23 | 18 |
| locations | mobile | `a` | Standing Stone State Park | 169.22 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Collins Gulf | 74.08 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Nathan Bedford Forrest State Park | 220.06 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | First Branch | 77.47 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Cucumber Gap | 96.03 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Burnt Mountain | 98.95 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Boulevard Prong | 105.89 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Cheatham WMA | 103.88 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Meeman-Shelby Forest State Park | 220.11 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Edgar Evins State Park | 146.11 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | T.O. Fuller State Park | 132.11 | 18 |
| locations | mobile | `a` | Tennessee | 67.72 | 18 |
| locations | mobile | `a` | Valles Caldera National Preserve | 207.66 | 18 |
| locations | mobile | `a` | New Mexico | 78.33 | 18 |
| locations | mobile | `a` | Flagstaff Snow Bowl Road | 168.89 | 18 |
| locations | mobile | `a` | Arizona | 47.94 | 18 |
| locations | mobile | `a` | Vicente Flat Trail | 105.83 | 18 |
| locations | mobile | `a` | California | 60.33 | 18 |
| locations | mobile | `a` | Mt. San Jacinto Long Valley | 177.42 | 18 |
| locations | mobile | `a` | California | 60.33 | 18 |
| locations | mobile | `a` | Mt. San Jacinto Deer Springs Trail | 216.61 | 18 |
| locations | mobile | `a` | California | 60.33 | 18 |
| locations | mobile | `a` | Big Bear Highway (CA-18) | 162 | 18 |
| locations | mobile | `a` | California | 60.33 | 18 |
| species | mobile | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| species | mobile | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| species | mobile | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| species | mobile | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| species | mobile | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| species | mobile | `a` | Abies alba | 66.34 | 18 |
| species | mobile | `a` | Silver Fir | 56.27 | 18 |
| species | mobile | `a` | 85.2' | 31.2 | 18 |
| species | mobile | `a` | 75'' | 21.09 | 18 |
| species | mobile | `a` | Abies amabilis | 92.08 | 18 |
| species | mobile | `a` | Pacific Silver Fir | 102.33 | 18 |
| species | mobile | `a` | 199.0' | 36.58 | 18 |
| species | mobile | `a` | 160'' | 27.81 | 18 |
| species | mobile | `a` | 27.0' | 28.78 | 18 |
| species | mobile | `a` | Abies balsamea | 101.38 | 18 |
| species | mobile | `a` | Balsam Fir | 68.2 | 18 |
| species | mobile | `a` | 103.9' | 36.72 | 18 |
| species | mobile | `a` | 96'' | 21.73 | 18 |
| species | mobile | `a` | 43.0' | 31.5 | 18 |
| species | mobile | `a` | Abies balsamea var. balsamea | 192.86 | 18 |
| species | mobile | `a` | Balsam Fir | 68.2 | 18 |
| species | mobile | `a` | 108.7' | 34.78 | 18 |
| species | mobile | `a` | 115'' | 23.95 | 18 |
| species | mobile | `a` | 38.2' | 31.02 | 18 |
| species | mobile | `a` | Abies cephalonica | 116.3 | 18 |
| species | mobile | `a` | Greek Fir | 58.53 | 18 |
| species | mobile | `a` | 105.5' | 37.36 | 18 |
| species | mobile | `a` | 111'' | 20 | 18 |
| species | mobile | `a` | Abies chinsiensis | 109.86 | 18 |
| species | mobile | `a` | Shensi Fir | 63.63 | 18 |
| species | mobile | `a` | 70.0' | 31.22 | 18 |
| species | mobile | `a` | 100'' | 28.94 | 18 |
| species | mobile | `a` | Abies cilicica | 82.92 | 18 |
| species | mobile | `a` | Cilician Fir | 66.91 | 18 |
| species | mobile | `a` | 51.3' | 28.03 | 18 |
| species | mobile | `a` | 46'' | 21.77 | 18 |
| species | mobile | `a` | Abies concolor | 94.69 | 18 |
| species | mobile | `a` | White Fir | 57.23 | 18 |
| species | mobile | `a` | 163.5' | 36.2 | 18 |
| species | mobile | `a` | 126'' | 27.2 | 18 |
| species | mobile | `a` | 45.3' | 31.27 | 18 |
| species | mobile | `a` | Abies concolor var. concolor | 179.47 | 18 |
| species | mobile | `a` | White Fir | 57.23 | 18 |
| species | mobile | `a` | 104.0' | 37.58 | 18 |
| species | mobile | `a` | 67'' | 20.06 | 18 |
| species | mobile | `a` | Abies concolor var. lowiana | 173.13 | 18 |
| species | mobile | `a` | White Fir | 57.23 | 18 |
| species | mobile | `a` | 242.1' | 34.95 | 18 |
| species | mobile | `a` | 219'' | 27.2 | 18 |
| species | mobile | `a` | Abies concolor var. lowiana x abies gran | 273.16 | 18 |
| species | mobile | `a` | Hybrid Fir | 62.2 | 18 |
| species | mobile | `a` | 206.9' | 40 | 18 |
| species | mobile | `a` | 129'' | 27.2 | 18 |
| species | mobile | `a` | Abies fargesii | 86.14 | 18 |
| species | mobile | `a` | Farges Fir | 63.84 | 18 |
| species | mobile | `a` | 57.0' | 28.59 | 18 |
| species | mobile | `a` | 53'' | 22.34 | 18 |
| species | mobile | `a` | Abies firma | 72.11 | 18 |
| species | mobile | `a` | Momi Fir | 55.92 | 18 |
| species | mobile | `a` | 70.8' | 30.39 | 18 |
| species | mobile | `a` | 79'' | 20.63 | 18 |
| species | mobile | `a` | Abies fraseri | 79.69 | 18 |
| species | mobile | `a` | Fraser Fir | 60.67 | 18 |
| species | mobile | `a` | 64.8' | 30.69 | 18 |
| species | mobile | `a` | 73'' | 20.91 | 18 |
| species | mobile | `a` | 27.0' | 28.78 | 18 |
| species | mobile | `a` | Abies grandis | 86.33 | 18 |
| species | mobile | `a` | Grand Fir | 58.8 | 18 |
| species | mobile | `a` | 170.1' | 31.28 | 18 |
| species | mobile | `a` | 132'' | 27.61 | 18 |
| species | mobile | `a` | Abies grandis var. grandis | 162.75 | 18 |
| species | mobile | `a` | Grand Fir | 58.8 | 18 |
| species | mobile | `a` | 223.4' | 39.42 | 18 |
| species | mobile | `a` | 269'' | 30.27 | 18 |
| species | mobile | `a` | Abies grandis var. idahoensis | 183.75 | 18 |
| species | mobile | `a` | Grand Fir | 58.8 | 18 |
| species | mobile | `a` | 215.6' | 36.28 | 18 |
| species | mobile | `a` | 159'' | 27.44 | 18 |
| species | mobile | `a` | Abies holophylla | 104.77 | 18 |
| species | mobile | `a` | Manchurian Fir | 95.48 | 18 |
| species | mobile | `a` | 87.3' | 28 | 18 |
| species | mobile | `a` | 69'' | 21.59 | 18 |
| species | mobile | `a` | 25.2' | 31.41 | 18 |
| species | mobile | `a` | Abies homolepis | 105.06 | 18 |
| species | mobile | `a` | Nikko Fir | 56.69 | 18 |
| species | mobile | `a` | 108.5' | 37.05 | 18 |
| species | mobile | `a` | 132'' | 27.61 | 18 |
| species | mobile | `a` | Abies lasiocarpa | 104.91 | 18 |
| species | mobile | `a` | Subalpine Fir | 84.25 | 18 |
| species | mobile | `a` | 133.0' | 37.14 | 18 |
| species | mobile | `a` | 84'' | 21.92 | 18 |
| species | mobile | `a` | Abies lasiocarpa var. arizonica | 191.58 | 18 |
| species | mobile | `a` | Corkbark Fir | 79.55 | 18 |
| species | mobile | `a` | 123.0' | 36.8 | 18 |
| species | mobile | `a` | 115'' | 23.95 | 18 |
| species | mobile | `a` | Abies lasiocarpa var. bifolia | 172.47 | 18 |
| species | mobile | `a` | Subalpine Fir | 84.25 | 18 |
| species | mobile | `a` | 142.2' | 36.36 | 18 |
| species | mobile | `a` | 83'' | 22.03 | 18 |
| species | mobile | `a` | Abies lasiocarpa var. lasiocarpa | 199.91 | 18 |
| species | mobile | `a` | Subalpine Fir | 84.25 | 18 |
| species | mobile | `a` | 97.4' | 27.47 | 18 |
| species | mobile | `a` | 52'' | 22.28 | 18 |
| species | mobile | `a` | Abies lasiocarpa var. latifolia | 180.3 | 18 |
| species | mobile | `a` | Subalpine Fir | 84.25 | 18 |
| species | mobile | `a` | 80.4' | 31.52 | 18 |
| species | mobile | `a` | 54'' | 22.22 | 18 |
| species | mobile | `a` | Abies lowiana | 88.33 | 18 |
| species | mobile | `a` | Sierra White Fir | 98.06 | 18 |
| species | mobile | `a` | 173.6' | 34.63 | 18 |
| species | mobile | `a` | 211'' | 23.7 | 18 |
| species | mobile | `a` | Abies magnifica | 101.59 | 18 |
| species | mobile | `a` | California Red Fir | 109.41 | 18 |
| species | mobile | `a` | 220.2' | 40.59 | 18 |
| species | mobile | `a` | 304'' | 31.19 | 18 |
| species | mobile | `a` | Abies nordmanniana | 130.39 | 18 |
| species | mobile | `a` | Nordmann Fir | 87.38 | 18 |
| species | mobile | `a` | 116.7' | 30.16 | 18 |
| species | mobile | `a` | 138'' | 27.41 | 18 |
| species | mobile | `a` | 39.0' | 31.48 | 18 |
| species | mobile | `a` | Abies numidica | 97.22 | 18 |
| species | mobile | `a` | Algerian Fir | 72.86 | 18 |
| species | mobile | `a` | 100.5' | 38.02 | 18 |
| species | mobile | `a` | 103'' | 28.09 | 18 |
| species | mobile | `a` | Abies pinsapo | 89.91 | 18 |
| species | mobile | `a` | Spanish Fir | 71.89 | 18 |
| species | mobile | `a` | 71.7' | 24.66 | 18 |
| species | mobile | `a` | 126'' | 27.2 | 18 |
| species | mobile | `a` | Abies procera | 87.53 | 18 |
| species | mobile | `a` | Noble Fir | 58.2 | 18 |
| species | mobile | `a` | 274.3' | 37.25 | 18 |
| species | mobile | `a` | 314'' | 27.14 | 18 |
| species | mobile | `a` | 30.0' | 32.45 | 18 |
| species | mobile | `a` | Abies recurvata var. ernestii | 175.23 | 18 |
| species | mobile | `a` | Min Fir | 43.92 | 18 |
| species | mobile | `a` | 87.4' | 27.89 | 18 |
| species | mobile | `a` | 65'' | 22.06 | 18 |
| species | mobile | `a` | Abies religiosa | 92.78 | 18 |
| species | mobile | `a` | Sacred Fir | 65.31 | 18 |
| species | mobile | `a` | 80.6' | 31.36 | 18 |
| species | mobile | `a` | Abies sachalinensis | 125.55 | 18 |
| species | mobile | `a` | Sakhalin Fir | 75.39 | 18 |
| species | mobile | `a` | 85.0' | 31.81 | 18 |
| species | mobile | `a` | 72'' | 20.86 | 18 |
| species | mobile | `a` | Abies spp. | 65.52 | 18 |
| species | mobile | `a` | Fir | 16.8 | 18 |
| species | mobile | `a` | 81.4' | 27.33 | 18 |
| species | mobile | `a` | 83'' | 22.03 | 18 |
| species | mobile | `a` | Abies veitchii | 84.13 | 18 |
| species | mobile | `a` | Shikoku Fir | 72.08 | 18 |
| species | mobile | `a` | 54.4' | 31.16 | 18 |
| species | mobile | `a` | 51'' | 19.13 | 18 |
| species | mobile | `a` | Acacia greggii | 90.05 | 18 |
| species | mobile | `a` | Catclaw Acacia | 98.66 | 18 |
| species | mobile | `a` | 23.3' | 30.86 | 18 |
| species | mobile | `a` | 25'' | 22.42 | 18 |
| species | mobile | `a` | Acer ×freemanii | 99.84 | 18 |
| species | mobile | `a` | Freeman Maple | 99.02 | 18 |
| species | mobile | `a` | 135.7' | 34.53 | 18 |
| species | mobile | `a` | 165'' | 27.3 | 18 |
| species | mobile | `a` | Acer barbatum | 95.19 | 18 |
| species | mobile | `a` | Southern Sugar Maple | 143.23 | 18 |
| species | mobile | `a` | 109.0' | 37.42 | 18 |
| species | mobile | `a` | 104'' | 27.84 | 18 |
| species | mobile | `a` | Acer buergenlarium | 125.25 | 18 |
| species | mobile | `a` | Trident Maple | 87.23 | 18 |
| species | mobile | `a` | 38.8' | 30.81 | 18 |
| species | mobile | `a` | 31'' | 18.95 | 18 |
| species | mobile | `a` | Acer campestre | 101.41 | 18 |
| species | mobile | `a` | Hedge Maple | 84.84 | 18 |
| species | mobile | `a` | 60.6' | 31.2 | 18 |
| species | mobile | `a` | 23'' | 21.95 | 18 |
| site-detail | mobile | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| site-detail | mobile | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| site-detail | mobile | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| site-detail | mobile | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| site-detail | mobile | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| site-detail | mobile | `a.italic.hover:underline` | Thuja occidentalis | 114.78 | 18 |
| site-detail | mobile | `a.hover:underline` | Arborvitae | 66.05 | 18 |
| site-detail | mobile | `a.hover:underline` | 47.0' | 28.72 | 18 |
| site-detail | mobile | `a.hover:underline` | 95'' | 22.06 | 18 |
| site-detail | mobile | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| site-detail-alt | mobile | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| site-detail-alt | mobile | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| site-detail-alt | mobile | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| site-detail-alt | mobile | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| site-detail-alt | mobile | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Acer rubrum | 79.55 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Red Maple | 68.36 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 125.2' | 36.64 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 107'' | 26.28 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Carpinus caroliniana | 130.38 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | American Hornbeam | 130.61 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 45.0' | 31.97 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 40'' | 22.75 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Carya cordiformis | 112.06 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Bitternut Hickory | 107.17 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 130.5' | 37.31 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 113'' | 23.77 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Carya glabra | 81.14 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Pignut Hickory | 93.39 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 132.9' | 36.23 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 199'' | 26.97 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 64.0' | 31.5 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Carya laciniosa | 97.47 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Shellbark Hickory | 113.2 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 115.5' | 33.03 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 87'' | 20.5 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Carya ovata | 75.78 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Shagbark Hickory | 113.95 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 112.5' | 32.8 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 75'' | 21.09 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Carya spp. | 67.31 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Hickory | 48.41 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 114.0' | 33.13 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 120'' | 28.17 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Carya tomentosa | 109.58 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Mockernut Hickory | 120.52 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 135.0' | 37.31 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 120'' | 28.17 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Diospyros virginiana | 128.67 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | Common Persimmon | 133.17 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 105.0' | 37.88 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 77'' | 19.94 | 18 |
| site-detail-alt | mobile | `a.italic.hover:underline` | Fagus grandifolia | 109.59 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | American Beech | 104.61 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 114.0' | 33.13 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 144'' | 27.17 | 18 |
| site-detail-alt | mobile | `a.hover:underline` | 97.0' | 28.28 | 18 |
| site-detail-alt | mobile | `a.text-link.hover:underline` | Mississippi (US) | 99.91 | 18 |
| state-detail | mobile | `a.inline-flex.items-center` | Botanical name | 101.83 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | Common name | 98.36 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | Max height | 73.03 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | Max girth | 62.47 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | Max crown spread | 120.39 | 20 |
| state-detail | mobile | `a.italic.hover:underline` | Abies balsamea | 101.38 | 18 |
| state-detail | mobile | `a.hover:underline` | Balsam Fir | 68.2 | 18 |
| state-detail | mobile | `a.hover:underline` | 103.9' | 36.72 | 18 |
| state-detail | mobile | `a.hover:underline` | 58'' | 22.22 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies balsamea var. balsamea | 192.86 | 18 |
| state-detail | mobile | `a.hover:underline` | Balsam Fir | 68.2 | 18 |
| state-detail | mobile | `a.hover:underline` | 108.7' | 34.78 | 18 |
| state-detail | mobile | `a.hover:underline` | 68'' | 21.75 | 18 |
| state-detail | mobile | `a.hover:underline` | 17.0' | 25.63 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies cephalonica | 116.3 | 18 |
| state-detail | mobile | `a.hover:underline` | Greek Fir | 58.53 | 18 |
| state-detail | mobile | `a.hover:underline` | 105.5' | 37.36 | 18 |
| state-detail | mobile | `a.hover:underline` | 111'' | 20 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies cilicica | 82.92 | 18 |
| state-detail | mobile | `a.hover:underline` | Cilician Fir | 66.91 | 18 |
| state-detail | mobile | `a.hover:underline` | 51.3' | 28.03 | 18 |
| state-detail | mobile | `a.hover:underline` | 46'' | 21.77 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies concolor | 94.69 | 18 |
| state-detail | mobile | `a.hover:underline` | White Fir | 57.23 | 18 |
| state-detail | mobile | `a.hover:underline` | 113.0' | 33.38 | 18 |
| state-detail | mobile | `a.hover:underline` | 100'' | 28.94 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies concolor var. concolor | 179.47 | 18 |
| state-detail | mobile | `a.hover:underline` | White Fir | 57.23 | 18 |
| state-detail | mobile | `a.hover:underline` | 76.3' | 29.53 | 18 |
| state-detail | mobile | `a.hover:underline` | 67'' | 20.06 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies firma | 72.11 | 18 |
| state-detail | mobile | `a.hover:underline` | Momi Fir | 55.92 | 18 |
| state-detail | mobile | `a.hover:underline` | 35.6' | 30.97 | 18 |
| state-detail | mobile | `a.hover:underline` | 19'' | 18.67 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies fraseri | 79.69 | 18 |
| state-detail | mobile | `a.hover:underline` | Fraser Fir | 60.67 | 18 |
| state-detail | mobile | `a.hover:underline` | 26.5' | 31.05 | 18 |
| state-detail | mobile | `a.hover:underline` | 13'' | 18.95 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies grandis | 86.33 | 18 |
| state-detail | mobile | `a.hover:underline` | Grand Fir | 58.8 | 18 |
| state-detail | mobile | `a.hover:underline` | 60.1' | 27.16 | 18 |
| state-detail | mobile | `a.hover:underline` | 49'' | 21.91 | 18 |
| state-detail | mobile | `a.italic.hover:underline` | Abies holophylla | 104.77 | 18 |
| state-detail | mobile | `a.hover:underline` | Manchurian Fir | 95.48 | 18 |
| state-detail | mobile | `a.hover:underline` | 87.3' | 28 | 18 |
| state-detail | mobile | `a.hover:underline` | 69'' | 21.59 | 18 |
| state-detail | mobile | `a.inline-flex.items-center` | Site | 25.97 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | RHI5 | 32.19 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | RHI10 | 38.16 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | RGI5 | 32.19 | 20 |
| state-detail | mobile | `a.inline-flex.items-center` | RGI10 | 38.16 | 20 |
| state-detail | mobile | `a.hover:underline` | 184 Main St., Moravia, NY | 159.41 | 18 |
| state-detail | mobile | `a.hover:underline` | Abraham Lincoln Park | 140.3 | 18 |
| state-detail | mobile | `a.hover:underline` | Alexander Preserve | 124.02 | 18 |
| state-detail | mobile | `a.hover:underline` | All Saints Chapel | 108.97 | 18 |
| state-detail | mobile | `a.hover:underline` | Alley Pond Park | 100.83 | 18 |
| state-detail | mobile | `a.hover:underline` | Allison Park | 75.83 | 18 |
| state-detail | mobile | `a.hover:underline` | Ampersand Basin | 112.33 | 18 |
| state-detail | mobile | `a.hover:underline` | Ampersand Mountain | 136.75 | 18 |
| state-detail | mobile | `a.hover:underline` | Ascent Of Mount Van Dorrien | 186.45 | 18 |
| state-detail | mobile | `a.hover:underline` | Bailey Arboretum | 110.41 | 18 |
| tree-detail | mobile | `a.italic.text-link` | Salix alba | 62.02 | 18 |
| tree-detail | mobile | `a.text-link.hover:underline` | White Willow | 83.05 | 18 |
| tree-detail | mobile | `a.text-link.hover:underline` | Tallyrand Park | 90.31 | 18 |
| tree-detail | mobile | `a.text-link.hover:underline` | Pennsylvania (US) | 113.36 | 18 |
| search | mobile | `a.home-link` | ← TreesDb | 65.53 | 19 |
| search | mobile | `a` | Ohio's Record Pin Oak | 159.78 | 21 |
| search | mobile | `a` | Ohio Champion White Oak | 194.8 | 21 |
| search | mobile | `a` | The Angel Oak | 106.69 | 21 |
| search | mobile | `a` | Oak Creek Canyon | 133.3 | 21 |
| search | mobile | `a` | Oak Openings Preserve | 169.36 | 21 |
| search | mobile | `a` | Oak Island | 76.31 | 21 |
| search | mobile | `a` | Dover Oak | 76.69 | 21 |
| search | mobile | `a` | Oakwood | 69.64 | 21 |
| search | mobile | `a` | Oakwood Cemetery | 144.03 | 21 |
| search | mobile | `a` | Oaky Woods Wildlife Management Area | 291.23 | 21 |
| search | mobile | `a` | Oak Wood Cemetery-Chittenango | 247.48 | 21 |
| search | mobile | `a` | Oakwood Cemetery - East Aurora | 242.66 | 21 |
| search | mobile | `a` | Oak Grove Cemetery | 150.63 | 21 |
| search | mobile | `a` | Oak Creek Wildlife Area | 172.36 | 21 |
| search | mobile | `a` | Big Urban Northern Red Oak, Lorain, Ohio | 306.44 | 21 |
| search | mobile | `a` | Big Oak Tree State Park | 168.36 | 21 |
| search | mobile | `a` | Wizard Of Oz Oak Grove | 177.39 | 21 |
| search | mobile | `a` | West Fork Of Oak Creek | 173.31 | 21 |
| search | mobile | `a` | White Oak Sinks | 118.3 | 21 |
| search | mobile | `a` | Sand Barrens And Oak-Pine Forest Preserv | 314.5 | 21 |
| search | mobile | `a` | Quercus spp. | 93.91 | 21 |
| search | mobile | `a` | Lithocarpus densiflorus var. densiflorus | 282.13 | 21 |
| search | mobile | `a` | Notholithocarpus densiflorus | 211.52 | 21 |
| search | mobile | `a` | Quercus acutissima | 139.55 | 21 |
| search | mobile | `a` | Quercus alba | 94.2 | 21 |
| search | mobile | `a` | Quercus arizonica | 128.7 | 21 |
| search | mobile | `a` | Quercus arkansana | 137.17 | 21 |
| search | mobile | `a` | Quercus austrina | 122.03 | 21 |
| search | mobile | `a` | Quercus bicolor | 114.42 | 21 |
| search | mobile | `a` | Quercus castaneifolia | 154.58 | 21 |
| search | mobile | `a` | Quercus cerris | 102.81 | 21 |
| search | mobile | `a` | Quercus chrysolepis var. chrysolepis | 260.11 | 21 |
| search | mobile | `a` | Quercus coccinea | 126.36 | 21 |
| search | mobile | `a` | Quercus coccinea var. coccinea | 222.33 | 21 |
| search | mobile | `a` | Quercus douglasii | 129.83 | 21 |
| search | mobile | `a` | Quercus durata var. gabrielensis | 230.95 | 21 |
| search | mobile | `a` | Quercus durifolia | 124.73 | 21 |
| search | mobile | `a` | Quercus ellipsoidalis | 148.44 | 21 |
| search | mobile | `a` | Quercus emoryi | 114.97 | 21 |
| search | mobile | `a` | Quercus falcata | 111.92 | 21 |
| search | mobile | `a` | Quercus fusiformis | 136.05 | 21 |
| search | mobile | `a` | Quercus gambelii var. gambelii | 223.03 | 21 |
| search | mobile | `a` | Quercus garryana var. garryana | 226.64 | 21 |
| search | mobile | `a` | Quercus geminata | 132.19 | 21 |
| search | mobile | `a` | Quercus georgiana | 137.2 | 21 |
| activity | mobile | `a.text-link.hover:underline` | Horse Creek | 79.14 | 18 |
| activity | mobile | `a.text-link.hover:underline` | North Carolina | 92.63 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Frozen Head State Park | 151.14 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Big South Fork | 94.97 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Shakerag Hollow | 108.38 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | College Of The South | 136.14 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Bearwaller Gap Trail | 128.38 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Winding Stairs Park | 125.92 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Torreya State Park | 117.13 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Florida | 43.59 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Radnor Lake State Park | 151.89 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Montgomery Bell State Park | 180.03 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Holly River State Park | 139.36 | 18 |
| activity | mobile | `a.text-link.hover:underline` | West Virginia | 84.16 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Ellison Park | 75.2 | 18 |
| activity | mobile | `a.text-link.hover:underline` | New York | 60.86 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Abraham Lincoln Park | 140.3 | 18 |
| activity | mobile | `a.text-link.hover:underline` | New York | 60.86 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Lucien Morin County Park | 164.84 | 18 |
| activity | mobile | `a.text-link.hover:underline` | New York | 60.86 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Pickett CCC Memorial State Park | 210.84 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Dunbar Cave State Park | 153.53 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Lafayette TN Downtown | 153.25 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Marshall Forest | 98.63 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Georgia | 49.39 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Virgin Falls State Natural Area | 191.44 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Bridgestone Nature Reserve | 179.55 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Overton Park | 83.98 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Hatchie National Wildlife Refuge | 205.66 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Hematite Lake | 92.59 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Kentucky | 59.23 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Standing Stone State Park | 169.22 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Collins Gulf | 74.08 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Nathan Bedford Forrest State Park | 220.06 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Burnt Mountain | 98.95 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Cucumber Gap | 96.03 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | First Branch | 77.47 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Boulevard Prong | 105.89 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Cheatham WMA | 103.88 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Meeman-Shelby Forest State Park | 220.11 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Edgar Evins State Park | 146.11 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | T.O. Fuller State Park | 132.11 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Tennessee | 67.72 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Valles Caldera National Preserve | 207.66 | 18 |
| activity | mobile | `a.text-link.hover:underline` | New Mexico | 78.33 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Flagstaff Snow Bowl Road | 168.89 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Arizona | 47.94 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Vicente Flat Trail | 105.83 | 18 |
| activity | mobile | `a.text-link.hover:underline` | California | 60.33 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Mt. San Jacinto Long Valley | 177.42 | 18 |
| activity | mobile | `a.text-link.hover:underline` | California | 60.33 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Mt. San Jacinto Deer Springs Trail | 216.61 | 18 |
| activity | mobile | `a.text-link.hover:underline` | California | 60.33 | 18 |
| activity | mobile | `a.text-link.hover:underline` | Big Bear Highway (CA-18) | 162 | 18 |
| activity | mobile | `a.text-link.hover:underline` | California | 60.33 | 18 |
| map | mobile | `a` | MapLibre | 50.03 | 14 |
| map | mobile | `a` | OpenStreetMap | 84.72 | 14 |
| map-popup-site | mobile | `.maplibregl-popup-close-button` | × | 7.02 | 20 |
| map-popup-site | mobile | `a` | MapLibre | 50.03 | 14 |
| map-popup-site | mobile | `a` | OpenStreetMap | 84.72 | 14 |
| map-popup-site | mobile | `a.shrink-0.text-xs` | View more details | 94.5 | 16 |
| map-popup-site | mobile | `button.maplibregl-popup-close-button` | × | 7.02 | 20 |
