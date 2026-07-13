#!/usr/bin/env python3
"""Check every link in the built _site/ for rot.

Run by .github/workflows/link-check.yml after `jekyll build`. Walks all built
HTML, then:
  - Internal links: FAIL if the target file doesn't exist in _site/.
  - External links: FAIL only on a definitive 404/410 (Gone). Anti-bot codes
    (202/401/403/405/429/999/418) and transient errors (timeouts, 5xx, DNS) are
    reported but do NOT fail the build — publishers (IEEE, OUP, Springer),
    LinkedIn, etc. block bots, and we don't want flaky CI. Real dead links
    (removed pages) reliably return 404, which is what we catch.

Exit code 1 if any broken link is found, else 0.
"""
import concurrent.futures as cf
import glob
import os
import re
import sys
import urllib.error
import urllib.request

SITE = "_site"

# Skip these link schemes / prefixes entirely.
SKIP_PREFIXES = ("mailto:", "tel:", "#", "data:", "javascript:")
# Skip these exact hosts (preconnect hints that 404 on a bare GET, by design).
SKIP_HOSTS = ("fonts.googleapis.com", "fonts.gstatic.com")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# A definitive "this page is gone" — the only thing we fail the build on.
DEAD_CODES = {404, 410}


def collect():
    internal, external = set(), set()
    for f in glob.glob(os.path.join(SITE, "**", "*.html"), recursive=True):
        with open(f, encoding="utf-8") as fh:
            html = fh.read()
        for url in re.findall(r'(?:href|src)="([^"]+)"', html):
            if url.startswith(SKIP_PREFIXES):
                continue
            if url.startswith("//"):
                url = "https:" + url
            if url.startswith("http"):
                if not any(h in url for h in SKIP_HOSTS):
                    external.add(url)
            else:
                internal.add((url, f))
    return internal, external


def check_internal(internal):
    broken = []
    for url, src in internal:
        path = url.split("#")[0].split("?")[0]
        if path in ("", "/"):
            continue
        fs = os.path.join(SITE, path.lstrip("/"))
        ok = os.path.isfile(fs) or (
            os.path.isdir(fs) and os.path.isfile(os.path.join(fs, "index.html")))
        if not ok:
            broken.append((url, src.replace(SITE + "/", "")))
    return broken


def fetch_status(url):
    """Return HTTP status code, retrying transient failures. 0 = unreachable."""
    last = 0
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                url, method="HEAD",
                headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=25) as r:
                return r.status
        except urllib.error.HTTPError as e:
            # Some servers reject HEAD (405) — retry once with GET.
            if e.code == 405:
                try:
                    req = urllib.request.Request(url, headers={"User-Agent": UA})
                    with urllib.request.urlopen(req, timeout=25) as r:
                        return r.status
                except urllib.error.HTTPError as e2:
                    return e2.code
                except Exception:
                    last = 0
                    continue
            return e.code
        except Exception:
            last = 0
    return last


def main():
    if not os.path.isdir(SITE):
        print("::error::_site/ not found — build the site before link-checking.")
        return 1

    internal, external = collect()
    print(f"Collected {len(internal)} internal + {len(external)} external links.\n")

    dead_internal = check_internal(internal)

    dead_external, warn_external = [], []
    with cf.ThreadPoolExecutor(max_workers=12) as ex:
        results = list(ex.map(lambda u: (u, fetch_status(u)), sorted(external)))
    for url, code in results:
        if code in DEAD_CODES:
            dead_external.append((url, code))
        elif code == 0 or code >= 500:
            warn_external.append((url, code or "unreachable"))

    if warn_external:
        print(f"⚠️  {len(warn_external)} link(s) not verifiable (anti-bot/transient — not failing):")
        for url, code in sorted(warn_external):
            print(f"    [{code}] {url}")
        print()

    broken = dead_internal or dead_external
    if not broken:
        print("✅ No broken links (no missing internal targets, no 404/410 externals).")
        return 0

    if dead_internal:
        print(f"❌ {len(dead_internal)} broken INTERNAL link(s):")
        for url, src in dead_internal:
            print(f"::error file={src}::broken internal link {url}")
            print(f"    {src} -> {url}")
    if dead_external:
        print(f"❌ {len(dead_external)} dead EXTERNAL link(s) (404/410):")
        for url, code in dead_external:
            print(f"::error::dead link [{code}] {url}")
            print(f"    [{code}] {url}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
