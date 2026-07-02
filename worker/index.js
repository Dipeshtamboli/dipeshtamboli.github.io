// Cloudflare Worker: privacy-friendly city-level visitor counter for the globe.
// - POST /hit   → increments the count for the visitor's city (from Cloudflare edge geo)
// - GET  /stats → returns [{ city, country, lat, lng, count }] for the globe
// Stores ONLY aggregate counts + coarse (2-decimal) coordinates. No IPs, no cookies.

const ALLOW = [
  "https://dipeshtamboli.github.io",
  // add your custom domain here later, e.g. "https://dipeshtamboli.com"
];
const KEY = "agg";
const MAX_CITIES = 5000;   // cap stored distinct cities
const MAX_RETURN = 400;    // cap points sent to the globe

function corsHeaders(origin) {
  const allowed = ALLOW.includes(origin) ? origin : ALLOW[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// strip anything that could break out of an attribute/HTML context, and cap length
function clean(s) {
  return (s == null ? "" : String(s)).replace(/[<>"'`&]/g, "").trim().slice(0, 60);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      const raw = await env.VISITORS.get(KEY);
      const map = raw ? JSON.parse(raw) : {};
      const arr = Object.values(map)
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_RETURN);
      return new Response(JSON.stringify(arr), {
        headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      });
    }

    if (url.pathname === "/hit" && request.method === "POST") {
      // soft origin gate (blocks casual cross-site abuse; not spoof-proof)
      if (!ALLOW.includes(origin)) return new Response(null, { status: 204, headers });

      const cf = request.cf || {};
      const country = clean(cf.country) || "??";
      const city = clean(cf.city) || "Unknown";
      const lat = cf.latitude != null ? Math.round(parseFloat(cf.latitude) * 100) / 100 : null;
      const lng = cf.longitude != null ? Math.round(parseFloat(cf.longitude) * 100) / 100 : null;
      if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
        return new Response(null, { status: 204, headers });
      }

      const k = (country + "|" + city).toLowerCase();
      const raw = await env.VISITORS.get(KEY);
      const map = raw ? JSON.parse(raw) : {};
      if (map[k]) {
        map[k].count++;
      } else if (Object.keys(map).length < MAX_CITIES) {
        map[k] = { city, country, lat, lng, count: 1 };
      }
      await env.VISITORS.put(KEY, JSON.stringify(map));
      return new Response(null, { status: 204, headers });
    }

    return new Response("visitor-globe worker: POST /hit, GET /stats", { status: 200, headers });
  },
};
