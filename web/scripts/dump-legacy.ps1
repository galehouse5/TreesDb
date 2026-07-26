#Requires -Version 5.1
<#
==============================================================================
 dump-legacy.ps1 -- TreesDb P0-03 legacy dump wrapper (sqlcmd-based)
==============================================================================

WHAT THIS DOES
  Runs every query in dump-legacy.sql (17 effective migrated tables) and
  dump-legacy-derived.sql (6 derived views + 3 search TVFs evaluated over
  -SearchTerms) against the production Azure SQL DB, and writes results as
  CSV:
    - Table dumps  -> -OutDir        (default ..\parity\dumps\)        GITIGNORED, PII
    - Derived dumps -> -DerivedOutDir (default ..\parity\snapshots\derived\) committed, public data
  Then writes -OutDir\manifest.json with row counts, dump timestamp, and
  server/database identity (no credentials).

HOW TO RUN
    # SQL auth
    .\dump-legacy.ps1 -Server tcp:treesdb.database.windows.net,1433 `
        -Database treesdb -Username readonly_dump_user -Password $env:TREESDB_SQL_PASSWORD `
        -PhotoProvider AzureBlob

    # Azure AD interactive (requires a sqlcmd build with -G support)
    .\dump-legacy.ps1 -Server tcp:treesdb.database.windows.net,1433 -Database treesdb -UseAadInteractive

  Prefer passing -Password via an environment variable (as above) rather
  than typing it on the command line -- it avoids leaving the plaintext
  password in your shell history.

EXPECTED DURATION
  Low single-digit minutes: production data is small (hundreds of sites,
  tens of thousands of trees/measurements at most); most of the wall time
  is sqlcmd process-launch overhead (17 table queries + 6 derived + 3
  search functions x term count, each its own sqlcmd invocation).

*** WARNING: -OutDir CONTENTS CONTAIN PII ***
  Users.Users columns include Email, PasswordHash (SHA-256 digest), and
  password-reset tokens. -OutDir is gitignored (web/.gitignore ->
  /parity/dumps/) -- never commit it, never paste its contents into an
  issue/chat/PR description, and delete local copies once the ETL load
  (P0-04) and data-parity checks (P0-06/07) are done with them.
  -DerivedOutDir contents are public aggregate data (species/site/state
  metrics, search rankings) and ARE meant to be committed.

REQUIREMENTS
  - sqlcmd on PATH. Two families exist and both work, with caveats:
      * Legacy ODBC-based sqlcmd (ships with "Microsoft Command Line
        Utilities for SQL Server" / SSMS). Supports -U/-P and -G
        (interactive Azure AD) on recent versions; does NOT support
        --access-token. Verify with `sqlcmd -?` -- look for a version
        >= 15.x (older versions may not support -f 65001 UTF-8 output,
        see ENCODING note below).
      * Modern Go-based "sqlcmd" (`winget install sqlcmd` / `go install
        github.com/microsoft/go-sqlcmd/cmd/sqlcmd@latest`). Supports
        --access-token directly (used by -AccessToken below) and is the
        easier path on a fresh Windows machine.
  - This script targets Windows PowerShell 5.1 syntax (no ??, ?., ternary,
    or Join-Path -AdditionalChildPath -- all PS7+-only features are
    deliberately avoided).

ENCODING / NULL-vs-EMPTY-STRING CSV CONVENTION
  Every SELECT in dump-legacy.sql / dump-legacy-derived.sql wraps each
  column in ISNULL(<formatted-expr>, N'NULL'), so a true SQL NULL always
  serializes as the literal 4-character token NULL. This script detects
  that exact token in the raw sqlcmd output and re-emits it UNQUOTED in
  the CSV; every other field (including a real empty string '') is
  double-quoted with embedded quotes doubled ("" per RFC 4180), per doc
  02 P0-03 / doc 07 section 7.1. This means:
      NULL            -> unquoted bare NULL
      empty string '' -> ""
      the value oak   -> "oak"
  This is exactly PostgreSQL's own `COPY ... CSV NULL 'NULL'` convention,
  so the P0-04 ETL loader can `COPY table FROM 'x.csv' WITH (FORMAT csv,
  HEADER true, NULL 'NULL')` directly against these files.
  Output files are written as UTF-8 without BOM.

KNOWN LIMITATION -- embedded CR/LF in free-text columns
  sqlcmd's text-mode output puts one result row per line; a *Comments-style
  varchar/nvarchar column that happens to contain an embedded CR or LF
  (e.g. someone pasted a multi-line trip report into a Comments field)
  would corrupt this script's line-based row splitting. Before the main
  dump, this script runs Test-EmbeddedNewlines, a lightweight pre-flight
  COUNT(*) check against every widened (varchar(1000)) comments-style
  column, and aborts with a clear error if any row contains CHAR(13) or
  CHAR(10). If that ever fires, the practical fix is to switch that one
  table to a bcp-based dump instead (bcp uses explicit, non-printable
  row/column terminators and is immune to embedded newlines):
      bcp "SELECT ... " queryout table.dat -S <server> -d <db> -U <user> -P <pw> ^
          -c -C 65001 -t "<unit-sep-as-hex>" -r "<record-sep-as-hex>"
  bcp's native/character export is the standard alternative for exactly
  this scenario; it isn't implemented here because production data has
  never been observed to contain embedded newlines in these columns (the
  legacy web UI uses single-line <input> controls for County/Comments
  fields per the .cshtml views), but the check exists so a future data
  entry via direct SQL wouldn't silently corrupt a dump.

PARAMETERS
  -Server            SQL Server host, e.g. tcp:treesdb.database.windows.net,1433
  -Database          Database name
  -Username / -Password   SQL auth (both required together)
  -AccessToken        Azure AD access token string (requires go-sqlcmd)
  -UseAadInteractive  Switch: use `sqlcmd -G` interactive Azure AD browser auth
  -OutDir             Table-dump output dir (default web\parity\dumps)
  -DerivedOutDir      Derived-object output dir (default web\parity\snapshots\derived)
  -SearchTerms        String array of search terms for the 3 search TVFs.
                       Default is a placeholder 10-term list -- TODO: sync
                       with the real parity corpus once web/parity/corpus.ts
                       exists (doc 07 section 3 calls for 30 terms).
  -PhotoProvider      'PhotoStore' or 'AzureBlob' -- record which photo
                       store production uses (doc 01 section 11 / doc 02
                       P0-03). Check the deployed Web.config
                       (Tmd.Model/Photos/DefaultPhotoStoreProvider.cs vs
                       Tmd.WindowsAzure/BlobStoragePhotoStoreProvider.cs
                       registration) if unsure; pass it here once known so
                       it lands in manifest.json for P0-09.
  -SqlcmdPath         Override the sqlcmd executable path/name (default: 'sqlcmd' on PATH)
  -SkipEmbeddedNewlineCheck  Switch: skip the pre-flight safety check above (not recommended)
==============================================================================
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Server,

    [Parameter(Mandatory = $true)]
    [string]$Database,

    [string]$Username,

    [string]$Password,

    [string]$AccessToken,

    [switch]$UseAadInteractive,

    [string]$OutDir,

    [string]$DerivedOutDir,

    [string[]]$SearchTerms = @('oak', 'OH', 'USA', 'park', 'white', '%', '_', 'quercus', 'zzznone', 'e'),

    [ValidateSet('PhotoStore', 'AzureBlob')]
    [string]$PhotoProvider,

    [string]$SqlcmdPath = 'sqlcmd',

    [switch]$SkipEmbeddedNewlineCheck,

    [switch]$NoEncrypt,

    # Execute queries in-process via System.Data.SqlClient instead of the
    # sqlcmd CLI. Rows never round-trip through a text file, so embedded
    # CR/LF in free-text columns (which corrupt sqlcmd's line-based output
    # and trip the pre-flight check) are handled correctly: they stay
    # inside their quoted CSV field. Supports -Username/-Password or
    # (with neither) Windows integrated auth; -AccessToken /
    # -UseAadInteractive are sqlcmd-only.
    [switch]$UseSqlClient
)

$ErrorActionPreference = 'Stop'

# -----------------------------------------------------------------------
# Resolve paths
# -----------------------------------------------------------------------
$ScriptDir = $PSScriptRoot
$SqlFile = Join-Path $ScriptDir 'dump-legacy.sql'
$DerivedSqlFile = Join-Path $ScriptDir 'dump-legacy-derived.sql'

if (-not $OutDir) {
    $OutDir = Join-Path (Join-Path $ScriptDir '..') (Join-Path 'parity' 'dumps')
}
if (-not $DerivedOutDir) {
    $DerivedOutDir = Join-Path (Join-Path $ScriptDir '..') (Join-Path 'parity' (Join-Path 'snapshots' 'derived'))
}

foreach ($dir in @($OutDir, $DerivedOutDir)) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

if (-not (Test-Path $SqlFile)) {
    throw "Cannot find $SqlFile"
}
if (-not (Test-Path $DerivedSqlFile)) {
    throw "Cannot find $DerivedSqlFile"
}

# -----------------------------------------------------------------------
# Locate sqlcmd (not needed for the -UseSqlClient path)
# -----------------------------------------------------------------------
$sqlcmdCmd = $null
if (-not $UseSqlClient) {
    $sqlcmdCmd = Get-Command $SqlcmdPath -ErrorAction SilentlyContinue
    if (-not $sqlcmdCmd) {
        throw "sqlcmd not found on PATH (looked for '$SqlcmdPath'). Install the " +
              "Go-based sqlcmd (winget install sqlcmd) or the legacy ODBC sqlcmd " +
              "(part of 'Microsoft Command Line Utilities for SQL Server' / SSMS), " +
              "or pass -SqlcmdPath to point at it explicitly. See the REQUIREMENTS " +
              "section in this script's header comment."
    }
}

# -----------------------------------------------------------------------
# SqlClient connection string (-UseSqlClient path)
# -----------------------------------------------------------------------
function Get-SqlClientConnectionString {
    $csb = New-Object System.Data.SqlClient.SqlConnectionStringBuilder
    $csb['Data Source'] = $Server
    $csb['Initial Catalog'] = $Database
    if ($AccessToken -or $UseAadInteractive) {
        throw '-AccessToken / -UseAadInteractive are not supported with -UseSqlClient; use SQL auth or integrated auth.'
    }
    if ($Username) {
        if (-not $Password) { throw '-Username was supplied without -Password.' }
        $csb['User ID'] = $Username
        $csb['Password'] = $Password
    }
    else {
        $csb['Integrated Security'] = $true
    }
    if (-not $NoEncrypt) {
        $csb['Encrypt'] = $true
        $csb['TrustServerCertificate'] = $true
    }
    return $csb.ConnectionString
}

# -----------------------------------------------------------------------
# Connection args
# -----------------------------------------------------------------------
function Get-ConnectionArgs {
    $connArgs = @('-S', $Server, '-d', $Database, '-b')  # -b: exit(1) on SQL error

    if ($AccessToken) {
        $connArgs += @('--access-token', $AccessToken)
    }
    elseif ($UseAadInteractive) {
        $connArgs += @('-G')
    }
    elseif ($Username) {
        if (-not $Password) {
            throw '-Username was supplied without -Password.'
        }
        $connArgs += @('-U', $Username, '-P', $Password)
    }
    else {
        # No credentials: fall back to Windows integrated auth (-E). Useful
        # for dumping a locally restored copy (LocalDB / SQL Express) --
        # e.g. a production .bacpac imported via sqlpackage.
        $connArgs += @('-E')
    }

    if (-not $NoEncrypt) {
        $connArgs += @('-N', '-C')  # encrypt connection, trust server cert (Azure SQL)
    }

    return $connArgs
}
$ConnArgs = $null
$SqlClientConnString = $null
if ($UseSqlClient) {
    Add-Type -AssemblyName System.Data
    $SqlClientConnString = Get-SqlClientConnectionString
}
else {
    $ConnArgs = Get-ConnectionArgs
}

# Unit separator (0x1F) -- essentially never appears in real column data,
# unlike comma/tab/pipe.
$Sep = [char]0x1F

function Invoke-SqlcmdQuery {
    <#
      Runs a single SQL batch through sqlcmd and returns an array of raw
      output lines (one per result row; header/dashes/row-count messages
      suppressed via -h -1 and the query's own SET NOCOUNT ON).
    #>
    param([string]$Sql)

    if ($UseSqlClient) {
        # In-process path: each row is one .NET string regardless of
        # embedded CR/LF in field values (no text-file round trip). Every
        # SELECT column in the dump SQL is a varchar expression wrapped
        # ISNULL(..., N'NULL'), so all values arrive as non-null strings.
        $conn = New-Object System.Data.SqlClient.SqlConnection($SqlClientConnString)
        try {
            $conn.Open()
            $cmd = $conn.CreateCommand()
            $cmd.CommandText = $Sql
            $cmd.CommandTimeout = 300
            $reader = $cmd.ExecuteReader()
            $lines = New-Object System.Collections.Generic.List[string]
            try {
                $fieldCount = $reader.FieldCount
                while ($reader.Read()) {
                    $vals = New-Object string[] $fieldCount
                    for ($i = 0; $i -lt $fieldCount; $i++) {
                        $vals[$i] = [string]$reader.GetValue($i)
                    }
                    $lines.Add(($vals -join $Sep))
                }
            }
            finally {
                $reader.Dispose()
            }
            return @($lines)
        }
        finally {
            $conn.Dispose()
        }
    }

    $tempSqlFile = [System.IO.Path]::GetTempFileName()
    $tempOutFile = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tempSqlFile, $Sql, (New-Object System.Text.UTF8Encoding($false)))

        $args = $ConnArgs + @(
            '-i', $tempSqlFile,
            '-o', $tempOutFile,
            '-s', $Sep,
            '-W',           # trim trailing whitespace per column
            '-h', '-1',     # no headers / no dashes row
            '-f', '65001'   # UTF-8 output (requires a reasonably modern sqlcmd; see REQUIREMENTS)
        )

        & $sqlcmdCmd.Source @args
        if ($LASTEXITCODE -ne 0) {
            throw "sqlcmd exited with code $LASTEXITCODE running:`n$Sql"
        }

        $raw = Get-Content -LiteralPath $tempOutFile -Encoding UTF8
        # Drop blank trailing lines sqlcmd sometimes emits.
        return @($raw | Where-Object { $_.Trim().Length -gt 0 })
    }
    finally {
        Remove-Item -LiteralPath $tempSqlFile -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $tempOutFile -ErrorAction SilentlyContinue
    }
}

function ConvertTo-CsvField {
    param([string]$Value)
    if ($Value -eq 'NULL') {
        return 'NULL'   # bare, unquoted -- see header comment's NULL convention
    }
    return '"' + ($Value -replace '"', '""') + '"'
}

function Write-CsvFile {
    <#
      $Header: string[] of column names
      $Rows:   string[] of raw sqlcmd output lines (unit-separator delimited)
      Writes RFC4180-ish CSV (CRLF line endings, UTF-8 no BOM) with the
      project's NULL convention (see header comment).
    #>
    param(
        [string]$Path,
        [string[]]$Header,
        [string[]]$Rows
    )

    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append(($Header | ForEach-Object { ConvertTo-CsvField $_ }) -join ',')
    [void]$sb.Append("`r`n")

    $rowCount = 0
    foreach ($line in $Rows) {
        $fields = $line.Split($Sep)
        if ($fields.Count -ne $Header.Count) {
            Write-Warning ("Row field count ({0}) != header count ({1}) in {2} -- " +
                "check for an embedded separator/newline in the source data. Row: {3}" -f `
                $fields.Count, $Header.Count, (Split-Path -Leaf $Path), $line)
        }
        [void]$sb.Append(($fields | ForEach-Object { ConvertTo-CsvField $_ }) -join ',')
        [void]$sb.Append("`r`n")
        $rowCount++
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $sb.ToString(), $utf8NoBom)
    return $rowCount
}

# -----------------------------------------------------------------------
# Marker parsing: pulls `-- ### <kind>: <name> ###` blocks out of a .sql
# file, each followed by zero or more `-- key: value` metadata comment
# lines and then the SQL batch itself (terminated by a trailing GO).
# -----------------------------------------------------------------------
function Get-SqlBlocks {
    param(
        [string]$Content,
        [string]$Kind   # 'table' | 'derived' | 'search'
    )

    # NOTE: the MatchCollection below is deliberately NOT named $matches --
    # PowerShell variable names are case-insensitive, so $matches and the
    # automatic $Matches variable (populated by every -match operator call,
    # including the metadata-line -match a few lines down) are the SAME
    # variable. Using $matches here would get silently clobbered by the
    # inner loop's -match calls partway through the outer loop. Ask how we
    # know: it happened, see dump-legacy.ps1 commit history / task report.
    $markerRegex = [regex]"(?m)^-- ### $Kind`: (\S+) ###\s*$"
    $markerMatches = $markerRegex.Matches($Content)
    $blocks = @()

    for ($i = 0; $i -lt $markerMatches.Count; $i++) {
        $m = $markerMatches[$i]
        $name = $m.Groups[1].Value
        $startIdx = $m.Index + $m.Length
        if ($i + 1 -lt $markerMatches.Count) {
            $endIdx = $markerMatches[$i + 1].Index
        }
        else {
            $endIdx = $Content.Length
        }
        $blockText = $Content.Substring($startIdx, $endIdx - $startIdx)
        $lines = $blockText -split "`r`n|`n"

        $meta = @{}
        $sqlLines = @()
        $inSql = $false
        foreach ($line in $lines) {
            if (-not $inSql -and $line -match '^-- ([a-zA-Z][a-zA-Z ]*):\s?(.*)$') {
                $meta[$Matches[1]] = $Matches[2]
                continue
            }
            if (-not $inSql -and $line.Trim().Length -eq 0) {
                continue
            }
            $inSql = $true
            $sqlLines += $line
        }

        $sql = ($sqlLines -join "`r`n").Trim()
        $sql = [regex]::Replace($sql, '(?m)^GO\s*$', '').Trim()

        $columns = @()
        if ($meta.ContainsKey('columns')) {
            $columns = $meta['columns'] -split ','
        }

        $blocks += [PSCustomObject]@{
            Name    = $name
            Meta    = $meta
            Sql     = $sql
            Columns = $columns
        }
    }

    return $blocks
}

function Get-SafeFileToken {
    <# Turns an arbitrary search term into a filesystem-safe token. #>
    param([string]$Term)
    $sb = New-Object System.Text.StringBuilder
    foreach ($ch in $Term.ToCharArray()) {
        if ($ch -match '[a-zA-Z0-9]') {
            [void]$sb.Append($ch)
        }
        else {
            [void]$sb.AppendFormat('_x{0:x2}', [int][char]$ch)
        }
    }
    if ($sb.Length -eq 0) {
        return '_empty'
    }
    return $sb.ToString()
}

# -----------------------------------------------------------------------
# Pre-flight: embedded CR/LF check (see KNOWN LIMITATION in header)
# -----------------------------------------------------------------------
function Test-EmbeddedNewlines {
    $checks = @(
        @{ Table = '[Sites].[SiteVisits]'; Column = 'Comments' },
        @{ Table = '[Imports].[Sites]'; Column = 'Comments' },
        @{ Table = '[Trees].[Measurements]'; Column = 'GeneralComments' },
        @{ Table = '[Imports].[Trees]'; Column = 'GeneralComments' },
        @{ Table = '[Imports].[Trees]'; Column = 'HeightComments' },
        @{ Table = '[Imports].[Trees]'; Column = 'GirthComments' },
        @{ Table = '[Imports].[Trees]'; Column = 'CrownComments' },
        @{ Table = '[Imports].[Trees]'; Column = 'TrunkComments' },
        @{ Table = '[Imports].[Trees]'; Column = 'TreeFormComments' },
        @{ Table = '[Imports].[Trees]'; Column = 'TerrainComments' },
        @{ Table = '[Imports].[Trunks]'; Column = 'TrunkComments' }
    )

    $offenders = @()
    foreach ($check in $checks) {
        $sql = "SET NOCOUNT ON; SELECT CAST(COUNT(*) AS varchar(20)) FROM $($check.Table) " +
               "WHERE [$($check.Column)] LIKE '%' + CHAR(13) + '%' OR [$($check.Column)] LIKE '%' + CHAR(10) + '%';"
        $result = @(Invoke-SqlcmdQuery -Sql $sql)
        $count = 0
        if ($result.Count -gt 0) { [void][int]::TryParse($result[0].Trim(), [ref]$count) }
        if ($count -gt 0) {
            $offenders += "$($check.Table).$($check.Column): $count row(s)"
        }
    }

    if ($offenders.Count -gt 0) {
        $msg = "Embedded CR/LF found in free-text columns -- the line-based CSV " +
               "dump below would corrupt these rows:`n  " + ($offenders -join "`n  ") +
               "`nSee the KNOWN LIMITATION section in this script's header comment " +
               "for the bcp-based mitigation. Re-run with -SkipEmbeddedNewlineCheck " +
               "only if you have manually verified this is safe to ignore."
        throw $msg
    }
}

# =========================================================================
# Main
# =========================================================================
Write-Host '=============================================================='
Write-Host ' TreesDb legacy dump (P0-03)'
Write-Host "  Server:   $Server"
Write-Host "  Database: $Database"
Write-Host "  OutDir:        $OutDir"
Write-Host "  DerivedOutDir: $DerivedOutDir"
Write-Host '=============================================================='
Write-Host ''
Write-Host 'REMINDER: check the deployed Web.config photo-provider setting' -ForegroundColor Yellow
Write-Host '  (local PhotoStore/ dir vs Azure Blob -- Tmd.Model/Photos/' -ForegroundColor Yellow
Write-Host '  DefaultPhotoStoreProvider.cs vs Tmd.WindowsAzure/' -ForegroundColor Yellow
Write-Host '  BlobStoragePhotoStoreProvider.cs registration) so P0-09 knows' -ForegroundColor Yellow
Write-Host '  where to copy photo originals from. Pass -PhotoProvider once known.' -ForegroundColor Yellow
Write-Host ''

if ($UseSqlClient) {
    # Embedded CR/LF is handled correctly by the in-process SqlClient path
    # (values never round-trip through a line-oriented text file), so the
    # pre-flight is unnecessary here.
    Write-Host 'Skipping embedded-newline pre-flight: -UseSqlClient handles embedded CR/LF safely.'
}
elseif (-not $SkipEmbeddedNewlineCheck) {
    Write-Host 'Running pre-flight embedded-newline check...'
    Test-EmbeddedNewlines
    Write-Host '  OK -- no embedded CR/LF found.'
}
else {
    Write-Warning 'Skipping embedded-newline pre-flight check (-SkipEmbeddedNewlineCheck).'
}

$dumpStartUtc = [DateTime]::UtcNow

# --- 17 table dumps -----------------------------------------------------
$tableSql = Get-Content -LiteralPath $SqlFile -Raw
$tableBlocks = Get-SqlBlocks -Content $tableSql -Kind 'table'
Write-Host ("Found {0} table block(s) in dump-legacy.sql" -f $tableBlocks.Count)

$manifestTables = @{}
foreach ($block in $tableBlocks) {
    Write-Host ("  dumping table '{0}'..." -f $block.Name)
    $rows = @(Invoke-SqlcmdQuery -Sql $block.Sql)
    $outPath = Join-Path $OutDir ($block.Name + '.csv')
    $rowCount = Write-CsvFile -Path $outPath -Header $block.Columns -Rows $rows
    $manifestTables[$block.Name] = $rowCount
    Write-Host ("    {0} row(s) -> {1}" -f $rowCount, $outPath)
}

# --- 6 derived-object dumps ----------------------------------------------
$derivedSql = Get-Content -LiteralPath $DerivedSqlFile -Raw
$derivedBlocks = Get-SqlBlocks -Content $derivedSql -Kind 'derived'
Write-Host ("Found {0} derived block(s) in dump-legacy-derived.sql" -f $derivedBlocks.Count)

$manifestDerived = @{}
foreach ($block in $derivedBlocks) {
    Write-Host ("  dumping derived object '{0}'..." -f $block.Name)
    $rows = @(Invoke-SqlcmdQuery -Sql $block.Sql)
    $outPath = Join-Path $DerivedOutDir ($block.Name + '.csv')
    $rowCount = Write-CsvFile -Path $outPath -Header $block.Columns -Rows $rows
    $manifestDerived[$block.Name] = $rowCount
    Write-Host ("    {0} row(s) -> {1}" -f $rowCount, $outPath)
}

# --- 3 search TVFs x -SearchTerms ----------------------------------------
$searchBlocks = Get-SqlBlocks -Content $derivedSql -Kind 'search'
Write-Host ("Found {0} search block(s); evaluating over {1} term(s): {2}" -f `
        $searchBlocks.Count, $SearchTerms.Count, ($SearchTerms -join ', '))

$manifestSearch = @{}
foreach ($block in $searchBlocks) {
    foreach ($term in $SearchTerms) {
        $escapedTerm = $term -replace "'", "''"
        $sql = $block.Sql -replace '__SEARCH_TERM__', $escapedTerm
        $token = Get-SafeFileToken -Term $term
        $fileName = "{0}__{1}.csv" -f $block.Name, $token
        Write-Host ("  evaluating '{0}' for term '{1}'..." -f $block.Name, $term)
        $rows = @(Invoke-SqlcmdQuery -Sql $sql)
        $outPath = Join-Path $DerivedOutDir $fileName
        $rowCount = Write-CsvFile -Path $outPath -Header $block.Columns -Rows $rows
        $manifestSearch["$($block.Name)/$term"] = $rowCount
        Write-Host ("    {0} row(s) -> {1}" -f $rowCount, $outPath)
    }
}

$dumpEndUtc = [DateTime]::UtcNow

# --- manifest.json (OutDir; no credentials) -------------------------------
$photoProviderValue = $PhotoProvider
if (-not $photoProviderValue) {
    $photoProviderValue = 'UNKNOWN - set -PhotoProvider after checking the deployed Web.config (see reminder above)'
}

$manifest = [ordered]@{
    server              = $Server
    database            = $Database
    dumpStartedUtc      = $dumpStartUtc.ToString('o')
    dumpFinishedUtc     = $dumpEndUtc.ToString('o')
    photoProvider       = $photoProviderValue
    csvNullConvention   = "NULL fields are an unquoted literal NULL token; all other fields are double-quoted (embedded quotes doubled). Matches PostgreSQL's COPY ... CSV NULL 'NULL'."
    searchTermsEvaluated = $SearchTerms
    searchTermsTodo     = 'Placeholder term list -- sync with the real parity corpus once web/parity/corpus.ts exists (doc 07 section 3).'
    tables              = $manifestTables
    derived             = $manifestDerived
    searchRowCounts     = $manifestSearch
}

$manifestPath = Join-Path $OutDir 'manifest.json'
# WriteAllText with explicit no-BOM UTF-8: PS5.1's `Set-Content -Encoding
# UTF8` writes a BOM, which strict JSON parsers reject.
[System.IO.File]::WriteAllText($manifestPath,
    ($manifest | ConvertTo-Json -Depth 6),
    (New-Object System.Text.UTF8Encoding($false)))
Write-Host ''
Write-Host "Manifest written: $manifestPath"

Write-Host ''
Write-Host '=============================================================='
Write-Host ' Done.'
Write-Host "  Tables dumped:   $($tableBlocks.Count) -> $OutDir  (GITIGNORED -- contains PII, do not commit)"
Write-Host "  Derived dumped:  $($derivedBlocks.Count) views + $($searchBlocks.Count) search fn(s) x $($SearchTerms.Count) term(s) -> $DerivedOutDir  (public, committed)"
Write-Host '  REMINDER: confirm/record -PhotoProvider for P0-09 if not already set.'
Write-Host '=============================================================='
