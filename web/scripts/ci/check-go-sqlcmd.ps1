# Runs go-sqlcmd the way dump-legacy.ps1 does with -GoSqlcmd (same flags,
# unit separator as -s, native argument passing from pwsh) against the CI
# SQL Server container, and checks the output is what the script parses:
# UTF-8 text, the bare NULL token, quotes kept, one separator-delimited line,
# no header row, over an encrypted connection (-N -C).
# Needs MSSQL_SA_PASSWORD and a SQL Server on localhost:1433.
$ErrorActionPreference = 'Stop'

$sep = [char]0x1F
$q = [System.IO.Path]::GetTempFileName()
$o = [System.IO.Path]::GetTempFileName()
try {
    $sql = @'
SET NOCOUNT ON;
SELECT ISNULL(N'Pokagon État', N'NULL'),
       ISNULL(CAST(NULL AS nvarchar(10)), N'NULL'),
       N'say "hi"',
       N'Ōhia lehua';
'@
    [System.IO.File]::WriteAllText($q, $sql, (New-Object System.Text.UTF8Encoding($false)))

    & sqlcmd -S 'tcp:localhost,1433' -d master -b -U sa -P $env:MSSQL_SA_PASSWORD -N -C `
        -i $q -o $o -s $sep -W -h -1
    if ($LASTEXITCODE -ne 0) {
        Get-Content -LiteralPath $o
        throw "sqlcmd exited with code $LASTEXITCODE"
    }

    $lines = @(Get-Content -LiteralPath $o -Encoding UTF8 | Where-Object { $_.Trim().Length -gt 0 })
    $want = @('Pokagon État', 'NULL', 'say "hi"', 'Ōhia lehua') -join $sep
    if ($lines.Count -ne 1 -or $lines[0] -ne $want) {
        $shown = ($lines | ForEach-Object { $_.Replace([string]$sep, '<US>') }) -join ' | '
        throw ("go-sqlcmd output isn't what dump-legacy.ps1 expects. Got {0} line(s): {1}" -f $lines.Count, $shown)
    }
    'go-sqlcmd output OK'
}
finally {
    Remove-Item -LiteralPath $q, $o -ErrorAction SilentlyContinue
}
