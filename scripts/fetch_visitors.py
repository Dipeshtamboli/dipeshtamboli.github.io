#!/usr/bin/env python3
"""Fetch per-country visitor counts from GoatCounter and write _data/visitors.json.
Env: GOATCOUNTER_CODE (site code), GOATCOUNTER_TOKEN (API token).
Run by .github/workflows/refresh-visitors.yml. No-ops safely if unconfigured."""
import json, os, sys, urllib.request

CODE = os.environ.get("GOATCOUNTER_CODE", "").strip()
TOKEN = os.environ.get("GOATCOUNTER_TOKEN", "").strip()
if not CODE or not TOKEN:
    print("GOATCOUNTER_CODE / GOATCOUNTER_TOKEN not set — skipping.")
    sys.exit(0)

# ISO-3166 alpha-2 -> (name, lat, lng) centroids (common subset; extend as needed)
C = {
 "US":("United States",38,-97),"IN":("India",22,79),"GB":("United Kingdom",54,-2),
 "DE":("Germany",51,10),"FR":("France",46,2),"CA":("Canada",56,-106),"JP":("Japan",36,138),
 "CN":("China",35,105),"AU":("Australia",-25,133),"SG":("Singapore",1.35,103.8),
 "NL":("Netherlands",52,5.75),"CH":("Switzerland",47,8),"SE":("Sweden",62,15),"IT":("Italy",42,12),
 "ES":("Spain",40,-4),"BR":("Brazil",-10,-55),"KR":("South Korea",37,127.5),"RU":("Russia",61,105),
 "PL":("Poland",52,19),"BE":("Belgium",50.6,4.7),"AT":("Austria",47.5,14),"IE":("Ireland",53,-8),
 "IL":("Israel",31,35),"HK":("Hong Kong",22.3,114.2),"TW":("Taiwan",23.7,121),"AE":("UAE",24,54),
 "TR":("Turkey",39,35),"PK":("Pakistan",30,70),"BD":("Bangladesh",24,90),"ID":("Indonesia",-2,118),
 "MX":("Mexico",23,-102),"NO":("Norway",62,10),"DK":("Denmark",56,10),"FI":("Finland",64,26),
 "PT":("Portugal",39.5,-8),"GR":("Greece",39,22),"CZ":("Czechia",49.8,15.5),"NZ":("New Zealand",-42,174),
 "ZA":("South Africa",-29,24),"NG":("Nigeria",9,8),"EG":("Egypt",27,30),"SA":("Saudi Arabia",24,45),
 "VN":("Vietnam",16,108),"TH":("Thailand",15,101),"MY":("Malaysia",4,102),"PH":("Philippines",13,122),
 "UA":("Ukraine",49,32),"RO":("Romania",46,25),"HU":("Hungary",47,20),"CL":("Chile",-30,-71),
 "AR":("Argentina",-34,-64),"CO":("Colombia",4,-73),"LK":("Sri Lanka",7.9,80.8),"NP":("Nepal",28,84),
}

url = "https://%s.goatcounter.com/api/v0/stats/locations" % CODE
req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=30) as r:
    payload = json.load(r)

rows = payload.get("stats") or payload.get("locations") or []
out = []
for row in rows:
    iso = (row.get("id") or row.get("code") or "").upper()[:2]
    cnt = int(row.get("count") or 0)
    if not iso or cnt <= 0 or iso not in C:
        continue
    name, lat, lng = C[iso]
    out.append({"country": row.get("name") or name, "code": iso, "lat": lat, "lng": lng, "count": cnt})

out.sort(key=lambda d: -d["count"])
os.makedirs("_data", exist_ok=True)
with open("_data/visitors.json", "w") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("Wrote _data/visitors.json with %d countries." % len(out))
