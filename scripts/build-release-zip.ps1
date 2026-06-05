$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$pluginSlug = 'editor-writing-goals'
$rootDir = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$distDir = Join-Path $rootDir 'dist'
$zipPath = Join-Path $distDir "$pluginSlug.zip"

$entries = @(
	@{ Source = 'editor-writing-goals.php'; Entry = "$pluginSlug/editor-writing-goals.php" },
	@{ Source = 'readme.txt'; Entry = "$pluginSlug/readme.txt" },
	@{ Source = 'uninstall.php'; Entry = "$pluginSlug/uninstall.php" },
	@{ Source = 'build/index.asset.php'; Entry = "$pluginSlug/build/index.asset.php" },
	@{ Source = 'build/index.css'; Entry = "$pluginSlug/build/index.css" },
	@{ Source = 'build/index-rtl.css'; Entry = "$pluginSlug/build/index-rtl.css" },
	@{ Source = 'build/index.js'; Entry = "$pluginSlug/build/index.js" },
	@{ Source = 'includes/class-editor-assets.php'; Entry = "$pluginSlug/includes/class-editor-assets.php" },
	@{ Source = 'includes/class-plugin.php'; Entry = "$pluginSlug/includes/class-plugin.php" },
	@{ Source = 'includes/class-post-meta.php'; Entry = "$pluginSlug/includes/class-post-meta.php" },
	@{ Source = 'includes/class-settings.php'; Entry = "$pluginSlug/includes/class-settings.php" }
)

if (-not (Test-Path -LiteralPath $distDir -PathType Container)) {
	New-Item -ItemType Directory -Path $distDir | Out-Null
}

if (Test-Path -LiteralPath $zipPath) {
	Remove-Item -LiteralPath $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open(
	$zipPath,
	[System.IO.Compression.ZipArchiveMode]::Create
)

try {
	foreach ($entry in $entries) {
		$sourcePath = Join-Path $rootDir $entry.Source

		if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
			throw "Missing release file: $($entry.Source)"
		}

		[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
			$archive,
			$sourcePath,
			$entry.Entry,
			[System.IO.Compression.CompressionLevel]::Optimal
		) | Out-Null
	}
} finally {
	$archive.Dispose()
}

$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

try {
	$zipEntries = @($archive.Entries | ForEach-Object { $_.FullName })
	$badEntry = $zipEntries | Where-Object {
		$_ -match '\\' -or
		$_ -match '(^|/)(\.git|\.github|node_modules|src|README\.md|package\.json|\.distignore|\.gitignore|pnpm-lock\.yaml|package-lock\.json|scripts)(/|$)'
	}

	if ($badEntry) {
		throw "Release zip contains excluded or invalid entries: $($badEntry -join ', ')"
	}

	if ($zipEntries -notcontains "$pluginSlug/editor-writing-goals.php") {
		throw "Release zip is missing $pluginSlug/editor-writing-goals.php"
	}

	$topLevelFolders = @(
		$zipEntries |
			ForEach-Object { ($_ -split '/')[0] } |
			Sort-Object -Unique
	)

	if ($topLevelFolders.Count -ne 1 -or $topLevelFolders[0] -ne $pluginSlug) {
		throw "Release zip must contain one top-level $pluginSlug folder."
	}
} finally {
	$archive.Dispose()
}

$zip = Get-Item -LiteralPath $zipPath
Write-Output "Created $($zip.FullName)"
Write-Output "Size: $($zip.Length) bytes"
Write-Output 'Release zip verified.'
