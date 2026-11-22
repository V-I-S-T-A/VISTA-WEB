# Official SheetJS package

`xlsx-0.20.3.tgz` is the unmodified SheetJS Community Edition release downloaded
over HTTPS from the publisher's authoritative CDN on 2026-11-22:

https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz

SHA-256: `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8`

This is a locally recorded digest, not a publisher-signed checksum. npm records
the tarball's SHA-512 integrity in `package-lock.json` and verifies it on install.
The package includes its Apache-2.0 license and notices; keep them intact.

The publisher documents this version and recommends vendoring at
https://docs.sheetjs.com/docs/getting-started/installation/nodejs/ . The npm
registry's legacy 0.18.5 release has no registry-published security fix.
Vendoring keeps clean CI/Railway installs independent of CDN availability.

0.20.3 includes the fixes for prototype pollution (CVE-2023-30533, fixed in
0.19.3) and ReDoS (CVE-2024-22363, fixed in 0.20.2). Do not rename the package,
ignore audit results, or change the high/critical security threshold.

For a future update, verify the publisher's release and advisories, replace the
official archive deliberately, update the manifest/lockfile and digest, review
the dependency diff, and run both export contract regressions and all CI checks.
The golden workbook contract in `tests/fixtures/xlsx-export-contract.json` was
captured from the actual browser downloads using 0.18.5 before this update; do
not regenerate it merely to accept changed export behavior.
