#!/usr/bin/env python3
"""Fetch citation stats from a Google Scholar profile and write _data/scholar.json.
Env: SCHOLAR_ID (profile user id, e.g. H8YEc-gAAAAJ).
Run by .github/workflows/refresh-scholar.yml.

Google Scholar aggressively rate-limits / CAPTCHAs automated requests (especially
from CI IP ranges), so this is best-effort: on any failure it keeps the existing
_data/scholar.json untouched and exits cleanly. When a fetch does succeed, the file
is only rewritten if the numbers actually changed (avoids daily no-op commits)."""
import datetime, html as html_lib, json, os, re, sys, time, unicodedata
import urllib.error, urllib.request

SCHOLAR_ID = os.environ.get("SCHOLAR_ID", "H8YEc-gAAAAJ").strip()
OUT = "_data/scholar.json"
PUBLICATIONS = "_data/publications.json"

if not SCHOLAR_ID:
    print("SCHOLAR_ID not set — skipping.")
    sys.exit(0)


def load_existing():
    try:
        with open(OUT) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


url = "https://scholar.google.com/citations?user=%s&hl=en&pagesize=100" % SCHOLAR_ID
# A real browser UA is required or Scholar serves a robot page.
req = urllib.request.Request(url, headers={
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/124.0 Safari/537.36"),
    "Accept-Language": "en-US,en;q=0.9",
})

html = None
last_err = None
for attempt in range(1, 4):
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            html = r.read().decode("utf-8", "replace")
        break
    except urllib.error.HTTPError as e:
        last_err = "HTTP %s" % e.code
    except (urllib.error.URLError, TimeoutError) as e:
        last_err = str(getattr(e, "reason", e))
    if attempt < 3:
        time.sleep(5 * attempt)

if html is None:
    print("Scholar fetch failed after retries (%s) — keeping existing %s." % (last_err, OUT))
    sys.exit(0)

# The stats table renders six <td class="gsc_rsb_std"> cells, in order:
#   citations(all), citations(since), h-index(all), h-index(since), i10(all), i10(since)
nums = [int(x) for x in re.findall(r'gsc_rsb_std"[^>]*>\s*([\d,]+)\s*<',
                                   html.replace(",", ""))]
if len(nums) < 6:
    # Likely a CAPTCHA / robot page rather than the profile.
    print("Scholar returned no stats table (rate-limited or CAPTCHA) — keeping existing %s." % OUT)
    sys.exit(0)

citations, h_index, i10_index = nums[0], nums[2], nums[4]
if citations <= 0:
    print("Scholar returned zero citations (suspect) — keeping existing %s." % OUT)
    sys.exit(0)

existing = load_existing()
data = {
    "citations": citations,
    "h_index": h_index,
    "i10_index": i10_index,
    "updated": datetime.date.today().isoformat(),
}


def normalize_title(value):
    value = unicodedata.normalize("NFKD", value).casefold()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def scholar_work_counts(page):
    """Return normalized-title -> citation count from the profile work table."""
    counts = {}
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', page, re.S):
        title_match = re.search(r'class="gsc_a_at"[^>]*>(.*?)</a>', row, re.S)
        cite_match = re.search(r'class="gsc_a_ac[^\"]*"[^>]*>([\d,]*)</a>', row)
        if not title_match or not cite_match or not cite_match.group(1):
            continue
        title = re.sub(r"<[^>]+>", "", title_match.group(1))
        title = html_lib.unescape(title)
        counts[normalize_title(title)] = int(cite_match.group(1).replace(",", ""))
    return counts


def refresh_publication_counts(page):
    try:
        with open(PUBLICATIONS, encoding="utf-8") as f:
            publications = json.load(f)
    except (OSError, ValueError) as e:
        print("Could not read %s (%s) — skipping per-paper counts." % (PUBLICATIONS, e))
        return 0

    counts = scholar_work_counts(page)
    changed = 0
    citation_chip = re.compile(r"^\d+ citations?$")
    for publication in publications:
        count = counts.get(normalize_title(publication.get("title", "")))
        if count is None:
            continue
        replacement = "%d citation%s" % (count, "" if count == 1 else "s")
        for chips in (publication.get("chips"), (publication.get("home") or {}).get("chips")):
            if not isinstance(chips, list):
                continue
            for index, chip in enumerate(chips):
                if citation_chip.match(chip) and chip != replacement:
                    chips[index] = replacement
                    changed += 1

    if changed:
        with open(PUBLICATIONS, "w", encoding="utf-8") as f:
            json.dump(publications, f, indent=2, ensure_ascii=False)
            f.write("\n")
    return changed


paper_changes = refresh_publication_counts(html)
stats_changed = not (
    existing.get("citations") == citations
    and existing.get("h_index") == h_index
    and existing.get("i10_index") == i10_index
)

if stats_changed or paper_changes:
    os.makedirs("_data", exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("Wrote %s: %d citations, h-index %d, i10-index %d; updated %d publication chip(s)." %
          (OUT, citations, h_index, i10_index, paper_changes))
else:
    print("No change (%d citations, h-index %d, i10 %d; publication chips current)." %
          (citations, h_index, i10_index))
