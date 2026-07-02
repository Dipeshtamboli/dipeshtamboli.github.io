# Visitor-globe Cloudflare Worker

Free, privacy-friendly **city-level** visitor counter for the site's globe. Cloudflare
supplies `city / country / latitude / longitude` at the edge, so no geocoding or IPs are stored —
only aggregate counts + coarse (2-decimal) coordinates.

## One-time deploy (needs a free Cloudflare account)

```bash
npm install -g wrangler        # or: npx wrangler ...
cd worker
wrangler login                 # opens browser to authorize your Cloudflare account

# create the KV store and copy the printed id into wrangler.toml (id = "...")
wrangler kv namespace create VISITORS

wrangler deploy                # prints your Worker URL, e.g.
                               #   https://visitor-globe.<your-subdomain>.workers.dev
```

## Wire it into the site

In `_config.yml` set:

```yaml
visitor_worker: "https://visitor-globe.<your-subdomain>.workers.dev"
```

Commit + push. Then:
- every page fires a tiny `POST /hit` beacon (only when `visitor_worker` is set),
- `/visitors.html` fetches `GET /stats` and plots **live city dots**.

Until `visitor_worker` is set, the site quietly falls back to the country-level
GoatCounter data — nothing breaks.

## Endpoints
- `POST /hit`  — increments the visitor's city (origin-gated to the site).
- `GET  /stats` — `[{ city, country, lat, lng, count }]`, cached 120s.

## Notes / limits
- Counts live in Cloudflare **KV** (free tier is generous). KV is eventually-consistent and
  this uses a single read-modify-write blob, so under heavy concurrent traffic a few
  increments can be lost — fine for a personal site. Swap to a Durable Object if you want exactness.
- `/hit` is origin-gated but not abuse-proof (a scripted client could inflate counts). It's a fun stat.
- Add your custom domain to the `ALLOW` list in `index.js` if you set one up.
